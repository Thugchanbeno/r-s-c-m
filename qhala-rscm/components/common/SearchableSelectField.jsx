import { Fragment, useState } from "react";
import {
  Combobox,
  Transition,
  ComboboxInput,
  ComboboxButton,
  ComboboxOptions,
  ComboboxOption,
} from "@headlessui/react";
import { CheckIcon, ChevronsUpDown } from "lucide-react";

const getProperty = (obj, path) => {
  if (!path) return obj;
  return path.split(".").reduce((o, k) => (o || {})[k], obj);
};

const SearchableSelectField = ({
  label,
  value,
  onChange,
  options = [],
  optionValueKey = "_id",
  optionDisplayKey = "name",
  optionSecondaryKey = null,
  placeholder = "Select an option",
  disabled = false,
  required = false,
  className = "",
  loadingDropdowns = false,
}) => {
  const [query, setQuery] = useState("");

  const getDisplayValue = (selectedValue) => {
    if (!selectedValue) return "";
    const selectedOption = options.find(
      (option) => getProperty(option, optionValueKey) === selectedValue
    );
    return selectedOption ? getProperty(selectedOption, optionDisplayKey) : "";
  };

  const filteredOptions =
    query === ""
      ? options
      : options.filter((option) => {
          const primaryText = getProperty(option, optionDisplayKey) || "";
          const secondaryText = optionSecondaryKey
            ? getProperty(option, optionSecondaryKey) || ""
            : "";
          const lowerQuery = query.toLowerCase();
          return (
            primaryText.toLowerCase().includes(lowerQuery) ||
            (optionSecondaryKey &&
              secondaryText.toLowerCase().includes(lowerQuery))
          );
        });

  return (
    <div className={className}>
      <Combobox value={value} onChange={onChange} disabled={disabled}>
        <label
          // Use a unique ID based on label if needed for accessibility, or pass an explicit ID prop
          // htmlFor={label.toLowerCase().replace(/\s+/g, '-')}
          className="block text-sm font-medium text-[rgb(var(--foreground))]"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        <div className="relative mt-1">
          <div className="relative w-full cursor-default overflow-hidden rounded-[var(--radius)] border border-[rgb(var(--border))] bg-[rgb(var(--background))] text-left shadow-sm focus-within:ring-1 focus-within:ring-[rgb(var(--primary))] focus-within:border-[rgb(var(--primary))]">
            <ComboboxInput
              className="w-full border-none py-2 pl-3 pr-10 text-sm leading-5 text-[rgb(var(--foreground))] bg-transparent focus:ring-0 placeholder:text-[rgb(var(--muted-foreground))]"
              onChange={(event) => setQuery(event.target.value)}
              displayValue={getDisplayValue}
              placeholder={placeholder}
              // id={label.toLowerCase().replace(/\s+/g, '-')}
            />
            <ComboboxButton className="absolute inset-y-0 right-0 flex items-center pr-2">
              <ChevronsUpDown
                className="h-5 w-5 text-[rgb(var(--muted-foreground))]"
                aria-hidden="true"
              />
            </ComboboxButton>
          </div>
          <Transition
            as={Fragment}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
            afterLeave={() => setQuery("")}
          >
            <ComboboxOptions className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-[var(--radius)] bg-[rgb(var(--background))] py-1 text-base shadow-lg ring-1 ring-[rgb(var(--border))] focus:outline-none sm:text-sm">
              {loadingDropdowns && ( // Display loading within dropdown if applicable
                <div className="relative cursor-default select-none py-2 px-4 text-[rgb(var(--muted-foreground))]">
                  Loading...
                </div>
              )}
              {!loadingDropdowns &&
              filteredOptions.length === 0 &&
              query !== "" ? (
                <div className="relative cursor-default select-none py-2 px-4 text-[rgb(var(--muted-foreground))]">
                  Nothing found.
                </div>
              ) : !loadingDropdowns &&
                filteredOptions.length === 0 &&
                query === "" ? (
                <div className="relative cursor-default select-none py-2 px-4 text-[rgb(var(--muted-foreground))]">
                  No options available.
                </div>
              ) : (
                filteredOptions.map((option) => (
                  <ComboboxOption
                    key={getProperty(option, optionValueKey)}
                    className={({ active }) =>
                      `relative cursor-default select-none py-2 pl-10 pr-4 ${
                        active
                          ? "bg-[rgba(var(--primary),0.1)] text-[rgb(var(--primary-foreground))]" // Adjusted active style
                          : "text-[rgb(var(--foreground))]"
                      }`
                    }
                    value={getProperty(option, optionValueKey)}
                  >
                    {({ selected, active }) => (
                      <>
                        <span
                          className={`block truncate ${
                            selected ? "font-medium" : "font-normal"
                          }`}
                        >
                          {getProperty(option, optionDisplayKey)}
                          {optionSecondaryKey && (
                            <span
                              className={`ml-2 ${
                                active
                                  ? "text-[rgb(var(--primary-foreground))]"
                                  : "text-[rgb(var(--muted-foreground))]"
                              } opacity-80`}
                            >
                              ({getProperty(option, optionSecondaryKey)})
                            </span>
                          )}
                        </span>
                        {selected ? (
                          <span
                            className={`absolute inset-y-0 left-0 flex items-center pl-3 ${
                              active
                                ? "text-[rgb(var(--primary-foreground))]"
                                : "text-[rgb(var(--primary))]"
                            }`}
                          >
                            <CheckIcon className="h-5 w-5" aria-hidden="true" />
                          </span>
                        ) : null}
                      </>
                    )}
                  </ComboboxOption>
                ))
              )}
            </ComboboxOptions>
          </Transition>
        </div>
      </Combobox>
    </div>
  );
};

export default SearchableSelectField;
