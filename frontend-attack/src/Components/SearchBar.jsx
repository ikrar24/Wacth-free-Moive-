import React, { useState, useEffect, memo } from "react";
import SearchResults from "./SearchResults";
import IfNotSearch from "./IfNotSearch";

function SearchBar() {
  const [SearchValue, setSearchValue] = useState("");
  const [showDefault, setShowDefault] = useState(true);
  const [SearchState, setSearchState] = useState([]);
  const [NotFound, setNotFound] = useState(false);

  // 🔍 searchApi Call
  const SearchApi = async () => {
    try {
      const ApiLink = await fetch(`http://localhost:3001/search?s=${SearchValue}`, {
        method: "POST",
      });

      const SearchData = await ApiLink.json();
      console.log(SearchData.message);
      setSearchState(SearchData);

      if (SearchData.message === "No results found") {
        setNotFound(true);
      } else {
        setNotFound(false);
      }

      // ✅ Jab search API chal jaye to default UI hata do
      setShowDefault(false);

    } catch (error) {
      console.error("❌ API Error:", error);
    }
  };

  // 🔘 handle SubmitEvent
  const handleSearch = (e) => {
    e.preventDefault();

    if (SearchValue.trim() !== "") {
      SearchApi();
    } else {
      // agar input empty hai to default UI wapas dikhana
      setShowDefault(true);
    }
  };

  // 🧠 user ne likhna band kar diya to default show karo
  useEffect(() => {
    if (SearchValue.trim().length === 0) {
      setShowDefault(true);
      setSearchState([]);
      setNotFound(false);
    }
  }, [SearchValue]);

  return (
    <>
      {/* 🔍 Search bar */}
      <nav className="w-full flex justify-center bg-black py-4">
        <form
          className="flex items-center justify-center w-[90%] gap-3 p-2 rounded-md shadow-md"
          onSubmit={handleSearch}
        >
          <input
            type="text"
            placeholder="Search Movies"
            className="py-2 w-[50%] px-2 rounded-md outline-none"
            onChange={(e) => setSearchValue(e.target.value)}
          />
          <button className="bg-gradient-to-r from-pink-400 to-blue-500 text-black font-bold px-4 py-2 rounded-md hover:scale-105 transition-transform duration-200">
            Search
          </button>
        </form>
      </nav>

      {/* ✅ Conditional Rendering */}
      <div className="text-center text-white mt-4">
        {showDefault ? (
          <IfNotSearch />
        ) : NotFound ? (
          <h1 className="text-xl font-bold text-red-500">No results found 😕</h1>
        ) : (
          <SearchResults data={SearchState} />
        )}
      </div>
    </>
  );
}

export default memo(SearchBar);
