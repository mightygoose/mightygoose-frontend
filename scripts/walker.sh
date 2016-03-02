#!/bin/bash

start_time=`date +%s`

#find items_data -name "*.json" | xargs -iFILE sh -c 'echo FILE; python scripts/restorer.py < FILE | python -mjson.tool > FILE.backup; mv FILE.backup FILE'
cat queue.txt | xargs -iFILE sh -c 'echo FILE; python scripts/restorer.py < FILE | python -mjson.tool > FILE.backup; mv FILE.backup FILE'

end_time=`date +%s`
echo execution time was `expr $end_time - $start_time` s.
