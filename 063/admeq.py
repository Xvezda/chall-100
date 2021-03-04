# Copyright (c) 2021 Xvezda <xvezda@naver.com>
#
# Use of this source code is governed by an MIT-style
# license that can be found in the LICENSE file or at
# https://opensource.org/licenses/MIT.

'''
Check possibility of site admin equivalence (or similarity) between two domains.
'''
import re
import sys
import time
import shlex
import shutil
import subprocess
import os.path as path

from urllib.request import Request, urlopen
from urllib.error import HTTPError, URLError
from urllib.parse import urlparse

import logging
logger = logging.getLogger(__name__)
logger.addHandler(logging.StreamHandler())


def print_info(*args, **kwds):
    print('[*]', *args, file=sys.stderr, **kwds)


def print_result(*args, **kwds):
    print('[+]', *args, **kwds)


def print_failure(*args, **kwds):
    print('[x]', *args, file=sys.stderr, **kwds)


def get_whois_output(domain):
    which_result = shutil.which('whois')
    if not which_result:
        raise NotImplementedError
    command = 'whois %s' % shlex.quote(domain)
    try:
        output = subprocess.check_output(command, shell=True)
    except subprocess.CalledProcessError:
        print_failure(f"executing command '{command}' failed")
        return ''
    return output.decode()


def get_whois_infos(domain):
    root_domain = get_root_domain(domain)
    output = get_whois_output(root_domain)
    logger.debug('get_whois_infos: output: %r' % output)
    return {
        'name_servers': get_name_servers(output),
        'registrar_id': get_registrar_id(output),
    }


def get_name_servers(output):
    founds = re.findall(r'^\s*name server:\s*([a-z0-9.-]+)\s*$', output, re.M|re.I)
    if not founds:
        founds = re.findall(r'\s*name\s*servers?:(?:.*?)([a-z0-9.-]+)\s*',
                            output, re.S|re.I)
    logger.debug('get_name_servers: founds: %r' % founds)

    # if not found:
    #     raise Exception('could not found name servers from domain')
    return list(set(map(lambda ns: ns.casefold().strip(), founds)))


def get_registrar_id(output):
    # Registrar IANA ID
    searched = re.search(r'^\s*registrar iana id:\s*(\d+)\s*$', output, re.M|re.I)
    if not searched:
        return
    return searched.group(1)


def get_alter_urls(url):
    '''Get alternative urls (e.g. webcache) as generator.'''
    yield 'https://webcache.googleusercontent.com/search?q=cache:%s' % url
    yield 'https://web.archive.org/web/%s' % url


def fetch_html(domain):
    print_info('fetching html from %s' % domain)

    url = 'http://%s' % domain
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) '
                      'AppleWebKit/537.36 (KHTML, like Gecko) '
                      'Chrome/87.0.0.0 Safari/537.36',
    }

    urls = [url]
    urls.extend(list(get_alter_urls(url)))

    requests = list(map(lambda u: Request(u, headers=headers), urls))

    while requests:
        try:
            response = urlopen(requests.pop(0))
        except (HTTPError, URLError) as e:
            logging.info('fetch_html: %r' % e)
        else:
            body = response.read()
            logger.debug('fetch_html: body: %r' % body)
            return body.decode()
    else:
        print_failure('could not fetch html from given domain', file=sys.stderr)


def get_analytics_id(html):
    print_info('searching for analytics...')

    searched = re.search(r'(UA-\d+)-\d+', html)
    logger.debug('get_analytics_id: searched: %r' % searched)
    if not searched:
        return
    return searched.group(1)


def get_advertise_id(html):
    print_info('searching for advertises...')

    # TODO: Use 'ads.txt' if not found
    searched = re.search(r'ca-pub-\d+', html)
    logger.debug('get_advertise_id: searched: %r' % searched)
    if not searched:
        return
    return searched.group(0)


def get_public_suffixes():
    here = path.abspath(path.dirname(__file__))
    filename = 'public_suffix_list.dat'
    with open(path.join(here, filename), 'r') as f:
        return [line.strip() for line in f.readlines()
                if not line.startswith('//') and line.strip()]


def get_root_domain(domain):
    suffixes = get_public_suffixes()
    matches = []
    for suffix in suffixes:
        if domain.endswith(suffix):
            matches.append(suffix)

    matches.sort(key=len, reverse=True)
    longest_suffix = matches[0]

    return '.'.join([
        domain.split('.').pop(-(longest_suffix.count('.')+2)), longest_suffix
    ])


def collect_info(domain):
    html = fetch_html(domain) or ''
    return {
        'analytics_id': get_analytics_id(html),
        'advertise_id': get_advertise_id(html),
        **get_whois_infos(domain),
    }


def compare_infos(this, that):
    same = []
    diff = []
    count = 0

    def compare(a, b):
        if isinstance(a, (set, list)) and isinstance(b, (set, list)):
            return set(a) & set(b)
        return a == b

    for key, value in this.items():
        print_info('comparing %s...' % key)
        comp = that.get(key)
        if (value and comp) and compare(value, comp):
            count += 1
            target = same
        else:
            target = diff
        target.append({
            'this': value,
            'that': comp,
        })

    return {
        'same': same,
        'diff': diff,
        'total_count': len(same) + len(diff),
        'equals_count': count,
    }


def main(args):
    # TODO: Support multiple (> 2) domains?
    site_domains = [args.this, args.that]
    site_infos = {}

    for domain in site_domains:
        site_infos[domain] = collect_info(domain)

    result = compare_infos(
        site_infos.get(site_domains[0]),
        site_infos.get(site_domains[1])
    )
    logger.debug('result: compare_infos: %r' % compare_infos)

    equals = int(result.get('equals_count'))
    totals = int(result.get('total_count'))

    print_result(f'total {equals} of {totals} are equals')
    # print_result('similarity between {0} and {1} is {2:.2f}%'.format(
    #     site_domains[0],
    #     site_domains[1],
    #     equals/totals * 100
    # ))


if __name__ == '__main__':
    import argparse
    parser = argparse.ArgumentParser()
    # TODO: Make delay and timeout works
    parser.add_argument('--delay', '-D', type=int, default=3000)
    parser.add_argument('--timeout', '-t', type=int)
    parser.add_argument('--verbose', '-v',
                        action='count', default=0,
                        help='set verbosity of logging')
    parser.add_argument('this', help='domain to investigate')
    parser.add_argument('that', help='another domain to compare')

    args = parser.parse_args()
    if args.verbose == 1:
        logger.setLevel(logging.INFO)
    elif args.verbose == 2:
        logger.setLevel(logging.DEBUG)

    main(args)

