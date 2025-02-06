const Loader = () => {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="relative w-24 h-24">
        <div className="absolute top-0 left-0 w-full h-full border-8 border-gray-200 rounded-full"></div>
        <div className="absolute top-0 left-0 w-full h-full border-8 border-[#FF5555] rounded-full animate-spin border-t-transparent"></div>
      </div>
    </div>
  );
};

export default Loader; 