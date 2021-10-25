import React from "react";

export const useOutsideAlerter = (ref: any) => {
  const [timestamp, setTimestamp] = React.useState<number>(0);

  React.useEffect(() => {
    /**
     * Alert if clicked on outside of element
     */
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target)) {
        setTimestamp(event.timeStamp);
      }
    }
    // Bind the event listener
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      // Unbind the event listener on clean up
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [ref]);

  return { timestamp };
};

export const classNames = (...classes: any[]) => {
  return classes.filter(Boolean).join(" ");
};
