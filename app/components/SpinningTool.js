'use client';

import { useEffect, useState } from 'react';

const PANEL_COUNT = 5; // Fixed number of panels for the prism layout

// Function to duplicate images for vertical carousel if less than 5 images in a product
const duplicateVerticalPanels = (images) => {
  const duplicatedImages = [...images];
  const totalImages = images.length;

  // If fewer than 5 images, duplicate them in a fixed sequence
  if (totalImages < PANEL_COUNT) {
    let i = 0;
    while (duplicatedImages.length < PANEL_COUNT) {
      duplicatedImages.push(images[i % totalImages]);
      i++;
    }
  }

  return duplicatedImages;
};

// Function to create non-duplicate order for products
const createNonDuplicateOrder = (items) => {
  if (!items || items.length === 0) {
    return [];
  }
  const result = [...items];
  const totalItems = items.length;

  // If there are fewer than 5 products, duplicate them but maintain the same sequence
  if (totalItems < PANEL_COUNT) {
    let i = 0;
    while (result.length < PANEL_COUNT) {
      result.push(items[i % totalItems]);
      i++;
    }
  }

  return result;
};

export default function SpinningTool({ 
  products = [], 
  collections = [], 
  yAxisDisplayMode = 'variants'
}) {
  const [horizontalIndex, setHorizontalIndex] = useState(0);
  const [verticalIndex, setVerticalIndex] = useState(0);
  const [activeCarousel, setActiveCarousel] = useState('horizontal');
  const [isMobileWidth, setIsMobileWidth] = useState(true);
  
  // Touch tracking states
  const [touchStartX, setTouchStartX] = useState(0);
  const [touchStartY, setTouchStartY] = useState(0);
  const [touchDeltaX, setTouchDeltaX] = useState(0);
  const [touchDeltaY, setTouchDeltaY] = useState(0);
  const [isMouseDown, setIsMouseDown] = useState(false);

  const rotationPerPanel = 360 / PANEL_COUNT;
  const verticalSwipeThreshold = 60;
  const horizontalSwipeThreshold = 60;

  // Check screen width
  const checkScreenWidth = () => {
    const screenWidth = window.innerWidth;
    setIsMobileWidth(screenWidth > 390);
  };

  useEffect(() => {
    checkScreenWidth();
    window.addEventListener('resize', checkScreenWidth);
    return () => window.removeEventListener('resize', checkScreenWidth);
  }, []);



  // Handle touch start
  const handleTouchStart = (e) => {
    setTouchStartX(e.touches[0].clientX);
    setTouchStartY(e.touches[0].clientY);
  };

  // Handle touch move
  const handleTouchMove = (e) => {
    e.preventDefault(); // Prevent default browser behavior
    
    const currentX = e.touches[0].clientX;
    const currentY = e.touches[0].clientY;
    const deltaX = currentX - touchStartX;
    const deltaY = currentY - touchStartY;

    setTouchDeltaX(deltaX);
    setTouchDeltaY(deltaY);

    // Apply real-time rotation based on the locked carousel
    if (Math.abs(deltaX) > Math.abs(deltaY) && activeCarousel === 'horizontal') {
      const carousel = document.querySelector('.carousel-horizontal');
      if (carousel) {
        const currentRotation = horizontalIndex * -rotationPerPanel + deltaX * 0.5;
        carousel.style.transform = `rotateY(${currentRotation}deg)`;
      }
    }

    if (Math.abs(deltaY) > Math.abs(deltaX) && activeCarousel === 'vertical') {
      const verticalCarousel = document.querySelector('.carousel-vertical');
      if (verticalCarousel) {
        const currentRotation = verticalIndex * -rotationPerPanel - deltaY * 0.5;
        verticalCarousel.style.transform = `rotateX(${currentRotation}deg)`;
      }
    }
  };

  // Handle Y-axis swipe
  const handleYAxisSwipe = (direction) => {
    if (yAxisDisplayMode === 'variants') {
      // For variants mode, we'll check if there are variants in the current vertical items
      // This will be handled by the component's state and the vertical carousel logic
      let slides = 1;
      if (direction === 'up') {
        setVerticalIndex((prevIndex) => prevIndex - slides);
      } else {
        setVerticalIndex((prevIndex) => prevIndex + slides);
      }
    } else if (yAxisDisplayMode === 'categoryProducts') {
      let slides = 1;
      if (direction === 'up') {
        setVerticalIndex((prevIndex) => prevIndex - slides);
      } else {
        setVerticalIndex((prevIndex) => prevIndex + slides);
      }
    }
  };

  // Handle touch end
  const handleTouchEnd = () => {
    // Handle vertical swipe
    if (Math.abs(touchDeltaY) > Math.abs(touchDeltaX)) {
      setActiveCarousel('vertical');
      const verticalCarousel = document.querySelector('.carousel-vertical');

      if (touchDeltaY < -verticalSwipeThreshold) {
        handleYAxisSwipe('up');
      } else if (touchDeltaY > verticalSwipeThreshold) {
        handleYAxisSwipe('down');
      }

      if (verticalCarousel) {
        verticalCarousel.style.transition = 'transform 0.3s ease';
        verticalCarousel.style.transform = `rotateX(${verticalIndex * -rotationPerPanel}deg)`;
      }

      setTouchDeltaX(0);
      setTouchDeltaY(0);
    }
    // Handle horizontal swipe
    else if (Math.abs(touchDeltaX) > Math.abs(touchDeltaY)) {
      setActiveCarousel('horizontal');
      const carousel = document.querySelector('.carousel-horizontal');

      let slides = 0;
      if (Math.abs(touchDeltaX) > 60) slides = 1;
      if (Math.abs(touchDeltaX) > 250) slides = 2;
      if (Math.abs(touchDeltaX) > 450) slides = 3;

      if (touchDeltaX < -horizontalSwipeThreshold) {
        setHorizontalIndex((prevIndex) => prevIndex + slides);
        setVerticalIndex(0);
      } else if (touchDeltaX > horizontalSwipeThreshold) {
        setHorizontalIndex((prevIndex) => prevIndex - slides);
        setVerticalIndex(0);
      }

      if (carousel) {
        carousel.style.transition = 'transform 0.3s ease';
        carousel.style.transform = `rotateY(${horizontalIndex * -rotationPerPanel}deg)`;
      }

      setTouchDeltaX(0);
      setTouchDeltaY(0);
    }
  };

  // Mouse event handlers for desktop
  const handleMouseDown = (e) => {
    e.preventDefault();
    setIsMouseDown(true);
    setTouchStartX(e.clientX);
    setTouchStartY(e.clientY);
  };

  const handleMouseMove = (e) => {
    if (!isMouseDown) return;
    e.preventDefault();
    
    const currentX = e.clientX;
    const currentY = e.clientY;
    const deltaX = currentX - touchStartX;
    const deltaY = currentY - touchStartY;

    setTouchDeltaX(deltaX);
    setTouchDeltaY(deltaY);

    // Apply real-time rotation based on the locked carousel
    if (Math.abs(deltaX) > Math.abs(deltaY) && activeCarousel === 'horizontal') {
      const carousel = document.querySelector('.carousel-horizontal');
      if (carousel) {
        const currentRotation = horizontalIndex * -rotationPerPanel + deltaX * 0.5;
        carousel.style.transform = `rotateY(${currentRotation}deg)`;
      }
    }

    if (Math.abs(deltaY) > Math.abs(deltaX) && activeCarousel === 'vertical') {
      const verticalCarousel = document.querySelector('.carousel-vertical');
      if (verticalCarousel) {
        const currentRotation = verticalIndex * -rotationPerPanel - deltaY * 0.5;
        verticalCarousel.style.transform = `rotateX(${currentRotation}deg)`;
      }
    }
  };

  const handleMouseUp = (e) => {
    if (!isMouseDown) return;
    e.preventDefault();
    setIsMouseDown(false);
    
    // Handle vertical swipe
    if (Math.abs(touchDeltaY) > Math.abs(touchDeltaX)) {
      setActiveCarousel('vertical');
      const verticalCarousel = document.querySelector('.carousel-vertical');

      if (touchDeltaY < -verticalSwipeThreshold) {
        handleYAxisSwipe('up');
      } else if (touchDeltaY > verticalSwipeThreshold) {
        handleYAxisSwipe('down');
      }

      if (verticalCarousel) {
        verticalCarousel.style.transition = 'transform 0.3s ease';
        verticalCarousel.style.transform = `rotateX(${verticalIndex * -rotationPerPanel}deg)`;
      }

      setTouchDeltaX(0);
      setTouchDeltaY(0);
    }
    // Handle horizontal swipe
    else if (Math.abs(touchDeltaX) > Math.abs(touchDeltaY)) {
      setActiveCarousel('horizontal');
      const carousel = document.querySelector('.carousel-horizontal');

      let slides = 0;
      if (Math.abs(touchDeltaX) > 60) slides = 1;
      if (Math.abs(touchDeltaX) > 250) slides = 2;
      if (Math.abs(touchDeltaX) > 450) slides = 3;

      if (touchDeltaX < -horizontalSwipeThreshold) {
        setHorizontalIndex((prevIndex) => prevIndex + slides);
        setVerticalIndex(0);
      } else if (touchDeltaX > horizontalSwipeThreshold) {
        setHorizontalIndex((prevIndex) => prevIndex - slides);
        setVerticalIndex(0);
      }

      if (carousel) {
        carousel.style.transition = 'transform 0.3s ease';
        carousel.style.transform = `rotateY(${horizontalIndex * -rotationPerPanel}deg)`;
      }

      setTouchDeltaX(0);
      setTouchDeltaY(0);
    }
  };

  // Handle carousel click
  const handleCarouselClick = (e) => {
    // Simple click handler - can be used for other interactions
  };

  // Determine the mode and prepare data
  const hasXAxisCollections = collections?.length > 0;
  const hasProducts = products?.length > 0;
  
  // Determine what data to use for horizontal carousel
  let horizontalItems = [];
  if (yAxisDisplayMode === 'variants' && hasProducts) {
    horizontalItems = products;
  } else if (hasXAxisCollections) {
    horizontalItems = collections;
  }

  // Create dynamic array for horizontal carousel
  const dynamicHorizontalArray = horizontalItems?.length > 5 ? createNonDuplicateOrder(horizontalItems) : createNonDuplicateOrder(horizontalItems);
  console.log("horizontalItems >>>> ", horizontalItems);
  console.log("dynamicHorizontalArray >>>> ", dynamicHorizontalArray);
  // Get the actual active item from the dynamic array
  const actualActiveItem = dynamicHorizontalArray?.[horizontalIndex % dynamicHorizontalArray.length];
  
  // Determine final active items and vertical items based on the actual active item
  let finalActiveProduct = null;
  let finalActiveCollection = null;
  let finalYAxisItems = [];
  
  if (yAxisDisplayMode === 'variants' && hasProducts && actualActiveItem) {
    // For variants mode, the actualActiveItem should be a product
    finalActiveProduct = actualActiveItem;
    
    // For vertical, show variants of the actual active product
    if (finalActiveProduct?.variants && finalActiveProduct.variants.length > 0) {
      finalYAxisItems = finalActiveProduct.variants;
    } else if (finalActiveProduct) {
      // Fallback: create a single item from the product's featured image
      finalYAxisItems = [{
        id: 'featured-' + finalActiveProduct.id,
        image: {
          url: finalActiveProduct.featuredImage?.url || 'https://via.placeholder.com/400x400?text=No+Image',
          altText: finalActiveProduct.title,
        },
      }];
    }
  } else if (hasXAxisCollections && actualActiveItem) {
    // For collections mode, the actualActiveItem should be a collection
    finalActiveCollection = actualActiveItem;
    
    // For vertical, show products from the actual active collection
    if (finalActiveCollection?.products && finalActiveCollection.products.length > 0) {
      finalYAxisItems = finalActiveCollection.products;
    }
  }
  
  // Debug information
  console.log('SpinningTool Debug:', {
    yAxisDisplayMode,
    hasXAxisCollections,
    hasProducts,
    horizontalItemsCount: horizontalItems?.length,
    dynamicArrayLength: dynamicHorizontalArray?.length,
    horizontalIndex,
    actualActiveItemTitle: actualActiveItem?.title,
    finalActiveProductTitle: finalActiveProduct?.title,
    finalActiveCollectionTitle: finalActiveCollection?.title,
    finalYAxisItemsCount: finalYAxisItems.length,
    verticalIndex,
    sampleHorizontalItem: dynamicHorizontalArray?.[0],
    sampleYAxisItem: finalYAxisItems?.[0],
    // Debug the first few items in dynamicHorizontalArray
    firstThreeItems: dynamicHorizontalArray?.slice(0, 3).map(item => ({
      title: item?.title,
      featuredImage: item?.featuredImage?.url
    }))
  });

  const currentProductVariants = duplicateVerticalPanels(finalYAxisItems || []);

  return (
    <div className="w-full h-full">
      {/* Control buttons */}
      <div className="w-full h-[8%] flex justify-between flex-row">
        <div className="w-[25%] h-full flex flex-row p-2 gap-3">
          {/* Placeholder for other controls */}
        </div>
      </div>

      {/* Spinning tool container */}
      <div className="spinturea-container w-full flex flex-col h-[88%] relative">
        <div className="relative w-[98%] h-full flex ml-1 flex-row overflow-hidden" id="center">
          <div
            className="carousel-container relative flex w-full"
            style={{
              position: 'relative',
              width: '100%',
              height: '90%',
              perspective: '1000px',
              touchAction: 'none',
              userSelect: 'none',
              WebkitUserSelect: 'none',
              MozUserSelect: 'none',
              msUserSelect: 'none',
            }}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onClick={handleCarouselClick}
          >
            {/* Vertical carousel (rotate around X-axis) */}
            <div
              className="carousel-vertical w-full h-full"
              style={{
                width: '100%',
                height: '100%',
                position: 'absolute',
                transformStyle: 'preserve-3d',
                transition: 'transform 1.3s ease-in-out',
                zIndex: activeCarousel === 'vertical' ? 2 : 1,
                transform: `rotateX(${verticalIndex * -rotationPerPanel}deg)`,
              }}
            >
              {currentProductVariants?.map((item, index) => {
                if (!item) return null; // Skip if item is undefined
                
                const rotateAngle = index * rotationPerPanel;
                const imageSrc = yAxisDisplayMode === 'variants'
                  ? item?.image?.url
                  : item?.featuredImage?.url || item?.image?.url || 'https://via.placeholder.com/400x400?text=No+Image';

                return (
                  <div
                    className="carousel-panel"
                    key={index}
                    style={{
                      position: 'absolute',
                      transition: 'transform 1.3s ease-in-out',
                      width: '100%',
                      height: '100%',
                      backfaceVisibility: 'hidden',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      transform: `rotateX(${rotateAngle}deg) translateZ(${
                        isMobileWidth ? '187px' : '150px'
                      })`,
                    }}
                  >
                    <div
                      className={`panel-content ${
                        isMobileWidth ? 'w-[16.5rem] h-[17.1rem]' : 'w-[13.2rem] h-[13.8rem]'
                      }`}
                      style={{
                        transition: 'transform 4s ease-in-out',
                        background: '#979494',
                        boxShadow: '0px 2px 1px rgba(0, 0, 0, 0.1)',
                        objectFit: 'cover',
                        overflow: 'hidden',
                      }}
                    >
                      <img
                        style={{
                          objectFit: 'cover',
                          width: '100%',
                          height: '100%',
                          transition: 'transform 4s ease-in-out',
                        }}
                        src={imageSrc}
                        alt="vertical-carousel-img"
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/400x400?text=No+Image';
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Horizontal carousel (rotate around Y-axis) */}
            <div
              className="carousel-horizontal z-40"
              style={{
                position: 'absolute',
                width: '100%',
                height: '100%',
                transformStyle: 'preserve-3d',
                backfaceVisibility: 'hidden',
                transition: 'transform 1.3s ease-in-out',
                zIndex: activeCarousel === 'horizontal' ? 2 : 1,
                transform: `rotateY(${horizontalIndex * -rotationPerPanel}deg)`,
              }}
            >
              {dynamicHorizontalArray?.map((item, index) => {
                const rotateAngle = index * rotationPerPanel;
                const isProduct = yAxisDisplayMode === 'variants';
                
                // Calculate the actual item index that should be displayed at this position
                const actualItemIndex = (horizontalIndex + index) % dynamicHorizontalArray.length;
                const actualItem = dynamicHorizontalArray[actualItemIndex];
                
                return (
                  <div
                    className="carousel-panel z-40"
                    key={index}
                    style={{
                      position: 'absolute',
                      width: '100%',
                      height: '100%',
                      backfaceVisibility: 'hidden',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      transform: `rotateY(${rotateAngle}deg) translateZ(${
                        isMobileWidth ? '181px' : '144px'
                      })`,
                    }}
                  >
                    <div
                      className={`panel-content z-40 ${
                        isMobileWidth ? 'w-[16.5rem] h-[17.1rem]' : 'w-[13.2rem] h-[13.8rem]'
                      }`}
                      style={{
                        background: '#979494',
                        boxShadow: '0px 3px 3px rgba(0, 0, 0, 0.2)',
                        objectFit: 'cover',
                        overflow: 'hidden',
                        position: 'relative',
                      }}
                    >
                      <img
                        src={
                          isProduct 
                            ? (item?.featuredImage?.url || item?.image?.url || 'https://via.placeholder.com/400x400?text=No+Image')
                            : (item?.image?.url || 'https://via.placeholder.com/400x400?text=No+Image')
                        }
                        alt={item?.title || (isProduct ? 'Product' : 'Collection')}
                        style={{
                          objectFit: 'cover',
                          width: '100%',
                          height: '100%',
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Active product info */}
      <div
        className={`${
          isMobileWidth ? '-mt-14' : '-mt-12'
        } w-full flex flex-col gap-2 justify-center items-center`}
      >
        <p className="text-gray-800 text-center text-base leading-3 font-semibold">
          {item?.title || finalActiveCollection?.title || 'No item selected'}
        </p>
      </div>
    </div>
  );
}
