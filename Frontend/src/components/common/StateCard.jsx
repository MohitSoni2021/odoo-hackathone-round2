import { motion } from 'framer-motion';

const StateCard = ({ details }) => {
  return (
    <motion.div 
      className="max-w-sm mx-auto bg-white min-w-[450px] rounded-xl shadow-md overflow-hidden md:max-w-2xl transform transition-all duration-300 hover:scale-105"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex flex-col relative">
        <div className="w-full">
          <img
            className="aspect-square w-full object-cover"
            src={details?.imageUrl || "https://source.unsplash.com/random/300x200/?travel"}
            alt={`${details.name} Destination`}
          />
        </div>
        <div className="absolute bottom-2 right-2 p-2 backdrop-blur-lg bg-white/10 text-white font-extrabold text-lg rounded-lg">
            {details?.name}
        </div>
      </div>
    </motion.div>
  );
};

export default StateCard;