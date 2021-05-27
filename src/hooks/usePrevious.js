import { useEffect, useRef } from "react";

// Hook
function usePrevious(value) {
    // The ref object is a generic container whose current property is mutable ...
    // ... and can hold any value, similar to an instance property on a class
    const ref = useRef();
    // Store current value in ref
    useEffect(() => {
        ref.current = value;
    }, [value]); // Only re-run if value changes
    // Return previous value (happens before update in useEffect above)
    return ref.current;
}
export default usePrevious

// import { useRef, useEffect} from "react"

// export const useIsMount = () => {
//     const isMountRef = useRef(true);
//     useEffect(() => {
//         isMountRef.current = false;
//     }, []);
//     return isMountRef.current;
// };
