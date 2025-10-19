import React from 'react';

function IfNotSearch() {
  const text = "Search Your Movie";

  // Different animations for variation
  const animations = [
    'fadeUp', 
    'scale', 
    'rotate', 
    'colorChange', 
    'bounce'
  ];

  return (
    <main className="w-full h-[80vh] flex items-center justify-center text-white ">
      <div className=" text-[55px]  font-bold uppercase flex flex-wrap justify-center">
        {text.split("").map((char, index) => {
          const anim = animations[index % animations.length]; // cycle animations
          const delay = index * 0.1;

          return (
            <span
              key={index}
              className="inline-block"
              style={{
                animation: `${anim} 2s ease-in-out ${delay}s infinite alternate`,
                display: 'inline-block',
              }}
            >
              {char === " " ? "\u00A0" : char}
            </span>
          );
        })}
      </div>

      <style>{`
        @keyframes fadeUp {
          0% { opacity: 0; transform: translateY(0); }
          50% { opacity: 1; transform: translateY(-10px); }
          100% { opacity: 0; transform: translateY(0); }
        }
        @keyframes scale {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.3); }
        }
        @keyframes rotate {
          0%, 100% { transform: rotate(0deg); }
          50% { transform: rotate(15deg); }
        }
        @keyframes colorChange {
          0%, 100% { color: white; }
          50% { color: #facc15; } /* yellow */
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-15px); }
        }
      `}</style>
    </main>
  );
}

export default IfNotSearch;
