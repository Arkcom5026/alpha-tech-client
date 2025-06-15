import React, { useState, useEffect } from 'react'
import { Swiper, SwiperSlide } from 'swiper/react';
import axios from 'axios'

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

// import required modules
import { Pagination, Autoplay, Navigation } from "swiper/modules";

const ContentCarousel = () => {
  const [data, setData] = useState([])

  useEffect(() => {
    handleGetImage()
  }, [])

  const handleGetImage = async () => {
    try {
      const res = await axios.get('https://picsum.photos/v2/list?page=1&limit=15')
      setData(res.data)
    } catch (err) {
      console.log('handleGetImage error --> ', err)
    }
  }

  return (
    <div className="w-full">
      <Swiper
        pagination={{ clickable: true }}
        modules={[Pagination, Autoplay, Navigation]}
        autoplay={{
          delay: 2500,
          disableOnInteraction: false,
        }}
        navigation={true}
        loop={data.length > 1}
        className="mySwiper h-80 object-cover rounded-md mb-4"
      >
        {data?.map((item) => (
          <SwiperSlide key={item.id} className="relative group">
            <img
              src={item.download_url}
              alt={item.author}
              className="h-full w-full object-cover rounded-md"
            />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent text-white text-sm p-2 rounded-b-md opacity-90 group-hover:opacity-100 transition-opacity">
              📸 {item.author}
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      <Swiper
        slidesPerView={1}
        breakpoints={{
          640: { slidesPerView: 2 },
          768: { slidesPerView: 3 },
          1024: { slidesPerView: 5 },
        }}
        spaceBetween={10}
        pagination={{ clickable: true }}
        navigation={true}
        modules={[Pagination, Autoplay, Navigation]}
        autoplay={{
          delay: 2500,
          disableOnInteraction: false,
        }}
        loop={data.length > 5}
        className="mySwiper object-cover rounded-md"
      >
        {data?.map((item) => (
          <SwiperSlide key={item.id} className="relative group">
            <img
              className='rounded-md w-full h-40 object-cover'
              src={item.download_url}
              alt={item.author}
            />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent text-white text-xs p-1 text-center rounded-b-md opacity-90 group-hover:opacity-100 transition-opacity">
              {item.author}
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  )
}

export default ContentCarousel;