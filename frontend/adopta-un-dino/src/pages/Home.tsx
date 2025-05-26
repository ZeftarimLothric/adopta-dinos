// src/pages/Home.tsx
import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-100 via-sky-100 to-white flex flex-col justify-center items-center px-6 text-center">
      <div className="max-w-2xl">
        <h1 className="text-6xl font-black text-indigo-800 drop-shadow-sm mb-6">
          🦖 DinoAdopta
        </h1>
        <p className="text-xl text-gray-700 mb-10 leading-relaxed">
          Descubre criaturas prehistóricas únicas y dales un nuevo hogar.
          Explora, elige y adopta con cariño.
        </p>
        <Link
          to="/adopciones"
          className="inline-block bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-8 py-3 text-lg font-semibold rounded-full shadow-lg hover:scale-105 transition-transform duration-300"
        >
          Ver Dinosaurios
        </Link>
      </div>

      <div className="mt-16 w-full max-w-4xl animate-bounce-slow">
        <img
          src="https://static.vecteezy.com/system/resources/previews/009/378/072/non_2x/cute-cartoon-dinosaur-character-free-png.png" // Puedes cambiar esto por una imagen dino estilo cartoon
          alt="Dinosaurio feliz"
          className="w-full max-h-[300px] object-contain mx-auto"
        />
      </div>
    </div>
  );
};

export default Home;
