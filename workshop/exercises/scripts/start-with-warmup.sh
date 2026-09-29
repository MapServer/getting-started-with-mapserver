#!/bin/bash
# Start MapServer with several FastCGI processes already running.
#
# mod_fcgid only starts a new MapServer process without delay when none
# is busy. Otherwise a request waits 1 second for a busy process to
# become free, so short concurrent requests (e.g. GetStyles + GetMap)
# are slow. Sending MIN_PROCESSES requests at once, right after start-up,
# starts that many processes; FcgidMinProcessesPerClass keeps them alive.
(
    sleep 3
    for _ in $(seq "${MIN_PROCESSES:-2}"); do
        (
            exec 3<>/dev/tcp/127.0.0.1/8080 \
                && printf 'GET / HTTP/1.0\r\nHost: localhost\r\n\r\n' >&3 \
                && cat <&3 >/dev/null
        ) &
    done
    wait
) &

# Continue with the image's normal start-up (Apache becomes PID 1)
exec /usr/local/bin/start-server