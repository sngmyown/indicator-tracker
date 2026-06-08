Run python scripts/update_market_data.py
Traceback (most recent call last):
  File "/home/runner/work/indicator-tracker/indicator-tracker/scripts/update_market_data.py", line 329, in <module>
    main()
  File "/home/runner/work/indicator-tracker/indicator-tracker/scripts/update_market_data.py", line 276, in main
    latest_vix, previous_vix = fetch_vix()
                               ^^^^^^^^^^^
  File "/home/runner/work/indicator-tracker/indicator-tracker/scripts/update_market_data.py", line 39, in fetch_vix
    csv_text = fetch_text(FRED_VIX_CSV_URL)
               ^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  File "/home/runner/work/indicator-tracker/indicator-tracker/scripts/update_market_data.py", line 34, in fetch_text
    with urllib.request.urlopen(request, timeout=25) as response:
         ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  File "/opt/hostedtoolcache/Python/3.11.15/x64/lib/python3.11/urllib/request.py", line 216, in urlopen
    return opener.open(url, data, timeout)
           ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  File "/opt/hostedtoolcache/Python/3.11.15/x64/lib/python3.11/urllib/request.py", line 519, in open
    response = self._open(req, data)
               ^^^^^^^^^^^^^^^^^^^^^
  File "/opt/hostedtoolcache/Python/3.11.15/x64/lib/python3.11/urllib/request.py", line 536, in _open
    result = self._call_chain(self.handle_open, protocol, protocol +
             ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  File "/opt/hostedtoolcache/Python/3.11.15/x64/lib/python3.11/urllib/request.py", line 496, in _call_chain
    result = func(*args)
             ^^^^^^^^^^^
  File "/opt/hostedtoolcache/Python/3.11.15/x64/lib/python3.11/urllib/request.py", line 1391, in https_open
    return self.do_open(http.client.HTTPSConnection, req,
           ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  File "/opt/hostedtoolcache/Python/3.11.15/x64/lib/python3.11/urllib/request.py", line 1352, in do_open
    r = h.getresponse()
        ^^^^^^^^^^^^^^^
  File "/opt/hostedtoolcache/Python/3.11.15/x64/lib/python3.11/http/client.py", line 1415, in getresponse
    response.begin()
  File "/opt/hostedtoolcache/Python/3.11.15/x64/lib/python3.11/http/client.py", line 330, in begin
    version, status, reason = self._read_status()
                              ^^^^^^^^^^^^^^^^^^^
  File "/opt/hostedtoolcache/Python/3.11.15/x64/lib/python3.11/http/client.py", line 291, in _read_status
    line = str(self.fp.readline(_MAXLINE + 1), "iso-8859-1")
               ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  File "/opt/hostedtoolcache/Python/3.11.15/x64/lib/python3.11/socket.py", line 718, in readinto
    return self._sock.recv_into(b)
           ^^^^^^^^^^^^^^^^^^^^^^^
  File "/opt/hostedtoolcache/Python/3.11.15/x64/lib/python3.11/ssl.py", line 1314, in recv_into
    return self.read(nbytes, buffer)
           ^^^^^^^^^^^^^^^^^^^^^^^^^
  File "/opt/hostedtoolcache/Python/3.11.15/x64/lib/python3.11/ssl.py", line 1166, in read
    return self._sslobj.read(len, buffer)
           ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
TimeoutError: The read operation timed out
Error: Process completed with exit code 1.
