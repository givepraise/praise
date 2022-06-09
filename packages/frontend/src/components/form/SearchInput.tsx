import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

interface SearchInputProps {
  handleChange: (element) => void;
  value: string;
}

const SearchInput = ({
  handleChange,
  value,
}: SearchInputProps): JSX.Element => {
  return (
    <div className="h-12 relative ml-6 flex items-center border border-black">
      <div className="absolute inset-y-0 left-0 flex items-center pl-3">
        <span className="text-gray-800 xs:text-xs">
          <FontAwesomeIcon
            icon={faMagnifyingGlass}
            size="1x"
            className="absolute transform -translate-y-1/2 top-1/2 left-3"
          />
        </span>
      </div>
      <input
        className="block pl-8 bg-transparent border-none outline-none focus:ring-0 text-sm"
        name="search"
        type="text"
        placeholder="Search"
        value={value}
        onChange={(e: React.ChangeEvent<HTMLInputElement>): void =>
          handleChange(e.target.value)
        }
      />
    </div>
  );
};

export default SearchInput;
