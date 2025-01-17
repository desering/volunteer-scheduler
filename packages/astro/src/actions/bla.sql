select events.*
from events
    join signups on signups.event_id = events.id
where signups.user_id = 3
order by events.start_date
limit 3
;
