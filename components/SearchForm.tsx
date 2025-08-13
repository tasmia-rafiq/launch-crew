import Form from "next/form";
import SearchFormReset from "./SearchFormReset";
import { Search } from "lucide-react";
import { useSearchParams } from "next/navigation";

const SearchForm = ({ query }: { query?: string }) => {
  const params = useSearchParams();

  const category = params.get("category") || "";
  const sort = params.get("sort") || "newest";

  return (
    <Form action={"/explore"} scroll={false} className="search-form">
      <input
        name="query"
        defaultValue={query}
        className="search-input"
        placeholder="Search startups..."
      />

      {/* preserve the other filters */}
      <input type="hidden" name="category" value={category} />
      <input type="hidden" name="sort" value={sort} />

      <div className="flex gap-2">
        {query && <SearchFormReset />}

        <button type="submit" className="search-btn text-black">
          <Search className="size-5" />
        </button>
      </div>
    </Form>
  );
};

export default SearchForm;
