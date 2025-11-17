import { useEffect, useState, type Dispatch, type SetStateAction } from "react";

const useLocalStorage = <T>(
  key: string,
  initialValue: T
  // eslint-disable-next-line no-unused-vars
): [T, Dispatch<SetStateAction<T>>] => {
  const [storedValue, setStoredValue] = useState(initialValue);

  useEffect(() => {
    // Retrieve from localStorage
    const item = window.localStorage.getItem(key);
    if (item) {
      setStoredValue(JSON.parse(item));
    }
  }, [key]);

  const setValue: Dispatch<SetStateAction<T>> = (value) => {
    // Save state
    setStoredValue((prevValue) => {
      const valueToStore = value instanceof Function ? value(prevValue) : value;
      // Save to localStorage
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
      return valueToStore;
    });
  };
  return [storedValue, setValue];
};

export default useLocalStorage;
