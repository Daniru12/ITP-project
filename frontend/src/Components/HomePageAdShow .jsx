import React, { useEffect, useState } from "react";
import axios from "axios";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css"; // Swiper core styles
import "swiper/css/autoplay"; // For auto slide
import { Autoplay } from "swiper/modules";

const HomePageAdShow = () => {
  const [approvedAds, setApprovedAds] = useState([]);

  useEffect(() => {
    const fetchApprovedAds = async () => {
      try {
        const backendUrl = import.meta.env.VITE_BACKEND_URL; // Fetch backend URL from env
        const response = await axios.get(`${backendUrl}/api/advertisement/approved`);
        setApprovedAds(response.data); // Set approved ads
      } catch (error) {
        console.error("Error fetching approved ads:", error);
      }
    };

    fetchApprovedAds();
  }, []);

  return (
    <div className="w-full">
      {approvedAds.length > 0 ? (
        <Swiper
          modules={[Autoplay]}
          spaceBetween={0}
          slidesPerView={1}
          autoplay={{ delay: 3000, disableOnInteraction: false }}
          loop={true}
        >
          {approvedAds.map((ad) => (
            <SwiperSlide key={ad._id}>
              <img
                src={ad.image_url}
                alt={ad.title}
                className="w-full h-[700px] object-cover"
              />
            </SwiperSlide>
          ))}
        </Swiper>
      ) : (
        <div className="text-center py-4">No approved advertisements available.</div>
      )}
    </div>
  );
};

export default HomePageAdShow;
