import { useState, useEffect } from "react";
import { DEFAULT_DEADLINE, CLOCK_FREEZE_UNTIL } from "../constants";
import { parseEventDatePDT } from "../utils/dateUtils";

export const useDeadlineClock = (upcomingEvents) => {
  const [timeLeft, setTimeLeft] = useState({ label: "", days: 0, hours: 0, mins: 0, secs: 0, urgent: false, frozen: false });

  useEffect(() => {
    const tick = () => {
      const now = new Date();

      // Phase 1: counting down to default deadline
      if (now < DEFAULT_DEADLINE) {
        const diff = DEFAULT_DEADLINE - now;
        setTimeLeft({
          label: "Palacios Federal Default — Answer Deadline",
          days: Math.floor(diff / 86400000),
          hours: Math.floor((diff % 86400000) / 3600000),
          mins: Math.floor((diff % 3600000) / 60000),
          secs: Math.floor((diff % 60000) / 1000),
          urgent: diff < 86400000,
        });
        return;
      }

      // Phase 2: frozen at zeros between Mar 28 midnight PDT and Apr 1 midnight PDT
      if (now < CLOCK_FREEZE_UNTIL) {
        setTimeLeft({ label: "Palacios Federal Default — 03/28/2026", days: 0, hours: 0, mins: 0, secs: 0, urgent: false, frozen: true });
        return;
      }

      // Phase 3: Apr 1+ — count to the next upcoming event (5:00 PM PDT that day)
      if (upcomingEvents.length > 0) {
        const ev = upcomingEvents[0];
        const target = new Date(parseEventDatePDT(ev.date).getTime() + 17 * 3600 * 1000);
        const diff = target - now;
        if (diff <= 0) {
          setTimeLeft({ label: ev.date + " \u2014 " + ev.event.slice(0, 55), days: 0, hours: 0, mins: 0, secs: 0, urgent: true });
          return;
        }
        setTimeLeft({
          label: ev.date + " \u2014 " + ev.event.slice(0, 55),
          days: Math.floor(diff / 86400000),
          hours: Math.floor((diff % 86400000) / 3600000),
          mins: Math.floor((diff % 3600000) / 60000),
          secs: Math.floor((diff % 60000) / 1000),
          urgent: diff < 86400000,
        });
      } else {
        setTimeLeft({ label: "No upcoming deadlines", days: 0, hours: 0, mins: 0, secs: 0, urgent: false });
      }
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [upcomingEvents]);

  return timeLeft;
};
