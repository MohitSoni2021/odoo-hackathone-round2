import { motion } from 'framer-motion';

const PlaceCard = ({ details }) => {
  return (
    <motion.div 
      className="max-w-sm mx-auto bg-white rounded-xl shadow-md overflow-hidden md:max-w-2xl transform transition-all duration-300 hover:scale-105"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex flex-col">
        <div className="w-full">
          <img
            className="aspect-video w-full object-cover"
            src={details.imageUrl || "https://source.unsplash.com/random/300x200/?travel"}
            alt={`${name} Destination`}
          />
        </div>
        <div className="p-8">
          <div className="uppercase tracking-wide text-sm text-indigo-500 font-semibold">Destination</div>
          <a href="#" className="block mt-1 text-lg leading-tight font-medium text-black hover:text-indigo-500">{name || "Generic Travel Spot"}</a>
          <p className="mt-2 text-gray-500">A beautiful place to explore with stunning views and rich culture.</p>
          <div className="mt-4">
            <p className="text-gray-600"><span className="font-bold">Location:</span> {details.location || "Somewhere, Country"}</p>
            <p className="text-gray-600"><span className="font-bold">Best Time to Visit:</span> {details.bestTime || "March - May"}</p>
            <p className="text-gray-600"><span className="font-bold">Weather:</span> {details.weather || "20°C - 30°C"}</p>
            <p className="text-gray-600"><span className="font-bold">Activities:</span> {details.activities || "Sightseeing, Hiking, Local Cuisine"}</p>
            <p className="text-gray-600"><span className="font-bold">Rating:</span> {details.rating || "★★★★☆ (4.5/5)"}</p>
          </div>
          <button className="mt-4 px-4 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-700 transition-colors">
            Plan Your Trip
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default PlaceCard;