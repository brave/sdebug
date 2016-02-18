# sdebug
A wrapper around debug() to add structured data logging, viz., [RFC5424](https://tools.ietf.org/html/rfc5424#section-6.3).

First,
take a look at the excellent [debug module](https://github.com/visionmedia/debug) to understand the basic concepts.

Next,
to add structure:


    % DEBUG='*' node

        // create a new debugging instance with the 'server' prefix
        var debug = new (require('sdebug'))('server')

        // add default properties for every log entry
        debug.initialize({ 'server': { id: server.info.id } })

        // create a log entry with unstructured text
        debug('hello world.')

        // outputs:
        server [server@1104 id="zekariah.local:58165:iksjwi0d"] hello world

        // create a log entry with structured data
        var params = { request: { id: '...', method: '...', pathname: '...', statusCode='...' },
                       headers: ... }
        debug('end', params)

        // outputs (newlines added for readability):
        server [request@1104 id="1455817135688:zekariah.local:58165:iksjwi0d:10000" method="GET" pathname="/" statusCode="200"]
               [headers@1104 content_type="text/html; charset=utf-8" cache_control="no-cache" vary="accept-encoding" content_encoding="gzip"]
               end
