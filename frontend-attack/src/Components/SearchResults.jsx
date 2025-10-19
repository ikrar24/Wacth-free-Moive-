import React from "react";
import {Link} from "react-router-dom"

function SearchResults({ data }) {
  const results = data;



  // handleSelectItem 
  const handleSelectItem = (item)=>{
console.log(item.id);

  }


  return (
    <main className="text-white w-full min-h-screen flex flex-col items-center justify-center flex-wrap">
      <div className="flex flex-wrap justify-center gap-6 w-full p-4">
        {results.map((item, i) => (
          <div
            key={i}
            className={`flex flex-col items-center bg-gray-800 p-3 rounded-sm cursor-pointer 
              ${
                results.length === 1
                  ? "w-[90%] md:w-[60%]" // 👈 single image ke liye width zyada
                  : "w-[70%] md:w-[40%]" // 👈 multiple images ke liye normal width
              }
            `}
           
          >
            {/* Image Box */}
            <Link className="bg-black rounded-md overflow-hidden w-full h-[200px] md:h-[250px] flex items-center justify-center" to={`/video-play/${item.id}`} 
            state={{id:item.id , thumbnails:item.thumbnails , title:item.details.title}}
            >
              <img
                src={item.thumbnails}
                alt={item.details?.title || "No Title"}
                className="h-full w-full object-cover"
              />
            </Link>

            {/* Title & Year */}
            <div className="w-full text-center mt-2 flex gap-1 justify-center items-center">
              <p>{item.details?.title || "Unknown"} -</p>
              <p>{item.details?.year || "N/A"}</p>
            </div>

            {/* Debug */}
            {/* {console.log(item)} */}
          </div>
        ))}
      </div>
    </main>
  );
}

export default SearchResults;
