import { useState, useEffect } from "react";

const useLocalStorage = (key: string, defaultValue: string | number | object) => {
    const [value, setValue] = useState(() => {
        let currentValue;

        try {
            currentValue = defaultValue;

            if (localStorage.getItem(key)) {
                currentValue = JSON.parse(localStorage.getItem(key)!);
            }
        } catch (error) {
            currentValue = defaultValue;
        }

        return currentValue;
    });

    useEffect(() => {
        localStorage.setItem(key, JSON.stringify(value));
    }, [value, key]);

    return [value, setValue];
};

export default useLocalStorage;
