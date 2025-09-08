"use client"
import {useEffect, useRef, useState} from 'react';


const PANEL_COUNT = 5; // Fixed number of panels for the prism layout
let continuous_Spinning_Direction = '';
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

  // Return a fixed array with at least 5 items
  return result;
};

export default function SpinningTool2({ 
  productsList = [], 
  collectionsData = [], 
  yAxisDisplayMode = 'variants'
}) {
  // productsList.pop();
  console.log("collectionData >>> ", collectionsData)
  console.log("yAxis Display mode >>> ", yAxisDisplayMode)
  const isDarkMode = false;
  const [products, setproducts] = useState([]);

  const [IsShowProductDesc, setShowProductDesc] = useState(false);

  const [horizontalIndex, setHorizontalIndex] = useState(0); // For X-axis carousel
  const [activeCarousel, setActiveCarousel] = useState('horizontal'); // Track active carousel
  const [isMobileWidth, setIsMobileWidth] = useState(true);

  const [filteredAllCollectionsProduct, setfilteredAllCollectionsProduct] =
    useState([]);
  const [noProductsFound, setNoProductsFound] = useState(false); // State to track if products are found or not
  const [IsDisplaySubCarousel, setIsDisplaySubCarousel] = useState(false);

  const rotationPerPanel = 360 / PANEL_COUNT; // Rotation angle for each panel
  const [IsContinouseSpinning, setIsContinouseSpinning] = useState(false);
  // Separate touch tracking states for horizontal and vertical carousels
  const [touchStartX, setTouchStartX] = useState(0);
  const [touchStartY, setTouchStartY] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false); // Track if the carousel is spinning
  const spinningInterval = useRef(null); // Store the interval ID
  const [touchDeltaX, setTouchDeltaX] = useState(0);
  const [touchDeltaY, setTouchDeltaY] = useState(0);
  const [isSpinningVertical, setIsSpinningVertical] = useState(false); // Track if the vertical carousel is spinning
  const spinningIntervalVertical = useRef(null); // Store the vertical interval ID
  const [verticalIndex, setVerticalIndex] = useState(0); // Vertical carousel index

  // Mouse tracking states for desktop
  const [mouseStartX, setMouseStartX] = useState(0);
  const [mouseStartY, setMouseStartY] = useState(0);
  const [mouseDeltaX, setMouseDeltaX] = useState(0);
  const [mouseDeltaY, setMouseDeltaY] = useState(0);
  const [isMouseDown, setIsMouseDown] = useState(false);

  const verticalSwipeThreshold = 60; // Minimum distance for vertical swipe detection
  const horizontalSwipeThreshold = 60;

  // Handle touch start: save initial touch position and time
  const handleTouchStart = (e) => {
    setTouchStartX(e.touches[0].clientX);
    setTouchStartY(e.touches[0].clientY); // Capture initial Y position
    // setTouchStartTime(Date.now()); // Start time for swipe detection
  };

  // Handle mouse down: save initial mouse position
  const handleMouseDown = (e) => {
    setIsMouseDown(true);
    setMouseStartX(e.clientX);
    setMouseStartY(e.clientY);
  };

  const handlSpinning = () => {
    setIsContinouseSpinning((prev) => !prev);
  };

  const handleYAxisSwipe = (direction) => {
    if (yAxisDisplayMode === 'variants') {
      const hasVariants =
        activeProduct?.variants && activeProduct.variants.length > 0;

      if (hasVariants) {
        let slides = 1;
        if (direction === 'up') {
          setVerticalIndex((prevIndex) => prevIndex - slides);
        } else {
          setVerticalIndex((prevIndex) => prevIndex + slides);
        }
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

  // Handle touch move: calculate the swipe delta and apply real-time rotation
  const handleTouchMove = (e) => {
    if (isSpinning || isSpinningVertical) return null;

    const currentX = e.touches[0].clientX;
    const currentY = e.touches[0].clientY;
    const deltaX = currentX - touchStartX;
    const deltaY = currentY - touchStartY; // Track Y-axis movement for vertical swipe

    setTouchDeltaX(deltaX); // Update deltaX for horizontal swipe detection
    setTouchDeltaY(deltaY); // Update deltaY for vertical swipe detection

    // if(Math.abs(deltaX) > Math.abs(deltaY)){

    //     setActiveCarousel("horizontal");
    // }

    // Apply real-time rotation based on the locked carousel
    if (Math.abs(deltaX) > Math.abs(deltaY) && activeCarousel == 'horizontal') {
      const carousel = document.querySelector('.carousel-horizontal');
      const currentRotation =
        horizontalIndex * -rotationPerPanel + deltaX * 0.5;
      carousel.style.transform = `rotateY(${currentRotation}deg)`;
    }

    if (Math.abs(deltaY) > Math.abs(deltaX) && activeCarousel == 'vertical') {
      if (!IsContinouseSpinning) {
        const verticalCarousel = document.querySelector('.carousel-vertical');
        const currentRotation =
          verticalIndex * -rotationPerPanel - deltaY * 0.5;
        verticalCarousel.style.transform = `rotateX(${currentRotation}deg)`;
      }
    }
  };

  // Handle mouse move: only track delta, no real-time rotation
  const handleMouseMove = (e) => {
    if (!isMouseDown || isSpinning || isSpinningVertical) return;

    const currentX = e.clientX;
    const currentY = e.clientY;
    const deltaX = currentX - mouseStartX;
    const deltaY = currentY - mouseStartY;

    setMouseDeltaX(deltaX);
    setMouseDeltaY(deltaY);
  };

  // Handle touch end: determine if it was a quick swipe or slow drag
  const handleTouchEnd = () => {
    // const swipeDuration = Date.now() - touchStartTime;
    // const isVerticalSwipe =
    //   Math.abs(touchDeltaY) > verticalSwipeThreshold &&
    //   Math.abs(touchDeltaY) > Math.abs(touchDeltaX);

    // const isQuickSwipe = swipeDuration < quickSwipeThreshold && Math.abs(touchDeltaX) > distanceThreshold;
    // const isVerticalQuickSwipe = swipeDuration < quickSwipeThresholdVertical && Math.abs(touchDeltaY) > distanceThresholdVertical;
    // console.log("touchDelta Y >>> ", touchDeltaY);


    //---------- Handle vertical (variants) swipe -----------
    if (Math.abs(touchDeltaY) > Math.abs(touchDeltaX)) {
      setActiveCarousel('vertical');
      const Verticalcarousel = document.querySelector('.carousel-vertical');

      // let slides = 0;
      // if (Math.abs(touchDeltaY) > 60) slides = 1;
      // if (Math.abs(touchDeltaY) > 60 && Math.abs(touchDeltaY) > 250)
      //   slides = 2;
      // if (Math.abs(touchDeltaY) > 300 && Math.abs(touchDeltaY) > 450)
      //   slides = 3;

      if (touchDeltaY < -verticalSwipeThreshold) {
        handleYAxisSwipe('up');
      } else if (touchDeltaY > verticalSwipeThreshold) {
        handleYAxisSwipe('down');
      }

      Verticalcarousel.style.transition = 'transform 0.3s ease';
      Verticalcarousel.style.transform = `rotateX(${
        verticalIndex * -rotationPerPanel
      }deg)`;

      // Reset deltas
      setTouchDeltaX(0);
      setTouchDeltaY(0);
    }
    //---------- Handle horizontal swipe -----------
    else if (Math.abs(touchDeltaX) > Math.abs(touchDeltaY)) {
      setActiveCarousel('horizontal');
      const carousel = document.querySelector('.carousel-horizontal');

      if (IsContinouseSpinning) {
        // Quick swipe: Start continuous spinning from the current rotation
        carousel.style.transform = `rotateY(${
          horizontalIndex * -rotationPerPanel
        }deg)`;
        startSpinning(touchDeltaX < 0 ? 'right' : 'left');
      } else {
        let slides = 0;
        if (Math.abs(touchDeltaX) > 60) slides = 1;
        if (Math.abs(touchDeltaX) > 60 && Math.abs(touchDeltaX) > 250)
          slides = 2;
        if (Math.abs(touchDeltaX) > 300 && Math.abs(touchDeltaX) > 450)
          slides = 3;
        // Slow swipe: Move one product in either direction
        if (touchDeltaX < -horizontalSwipeThreshold) {
          // Swipe left (next product)
          setHorizontalIndex((prevIndex) => prevIndex + slides);
          setVerticalIndex(0);
          // setTimeout(() => setVerticalIndex(verticalIndex + 1), 500);
        } else if (touchDeltaX > horizontalSwipeThreshold) {
          setHorizontalIndex((prevIndex) => prevIndex - slides);
          setVerticalIndex(0);
          // setTimeout(() => setVerticalIndex(verticalIndex + 1), 500);
        }
        carousel.style.transition = 'transform 0.3s ease'; // Smooth transition to final position
        carousel.style.transform = `rotateY(${
          horizontalIndex * -rotationPerPanel
        }deg)`;
      }

      // Reset deltas
      setTouchDeltaX(0);
      setTouchDeltaY(0);
      // setTimeout(() =>  setActiveCarousel("vertical"), 150);
    }
  };

  // Handle mouse up: determine if it was a drag and apply single product swipe
  const handleMouseUp = () => {
    if (!isMouseDown) return;
    
    setIsMouseDown(false);

    //---------- Handle vertical (variants) swipe -----------
    if (Math.abs(mouseDeltaY) > Math.abs(mouseDeltaX)) {
      setActiveCarousel('vertical');
      const Verticalcarousel = document.querySelector('.carousel-vertical');

      if (mouseDeltaY < -verticalSwipeThreshold) {
        handleYAxisSwipe('up');
      } else if (mouseDeltaY > verticalSwipeThreshold) {
        handleYAxisSwipe('down');
      }

      Verticalcarousel.style.transition = 'transform 0.3s ease';
      Verticalcarousel.style.transform = `rotateX(${
        verticalIndex * -rotationPerPanel
      }deg)`;

      // Reset deltas
      setMouseDeltaX(0);
      setMouseDeltaY(0);
    }
    //---------- Handle horizontal swipe -----------
    else if (Math.abs(mouseDeltaX) > Math.abs(mouseDeltaY)) {
      setActiveCarousel('horizontal');
      const carousel = document.querySelector('.carousel-horizontal');

      if (IsContinouseSpinning) {
        // Quick swipe: Start continuous spinning from the current rotation
        carousel.style.transform = `rotateY(${
          horizontalIndex * -rotationPerPanel
        }deg)`;
        startSpinning(mouseDeltaX < 0 ? 'right' : 'left');
      } else {
        // Desktop: Always move only one product at a time
        let slides = 1; // Fixed to 1 for desktop to ensure single product swipe
        
        // Slow swipe: Move one product in either direction
        if (mouseDeltaX < -horizontalSwipeThreshold) {
          // Swipe left (next product)
          setHorizontalIndex((prevIndex) => prevIndex + slides);
          setVerticalIndex(0);
        } else if (mouseDeltaX > horizontalSwipeThreshold) {
          setHorizontalIndex((prevIndex) => prevIndex - slides);
          setVerticalIndex(0);
        }
        carousel.style.transition = 'transform 0.3s ease'; // Smooth transition to final position
        carousel.style.transform = `rotateY(${
          horizontalIndex * -rotationPerPanel
        }deg)`;
      }

      // Reset deltas
      setMouseDeltaX(0);
      setMouseDeltaY(0);
    }
  };

  // Define a rotation step for smoother continuous spinning
  const rotationStep = 1; // Adjust this value for smaller, smoother rotation steps
  const intervalTime = 800;
  // Horizantal startSpinning function for smooth rotation
  const startSpinning = (direction) => {
    if (spinningInterval.current) return; // Prevent multiple intervals
    setIsSpinning(true);

    continuous_Spinning_Direction = direction;

    // Set initial rotation and apply CSS transition for smoothness
    const carousel = document.querySelector('.carousel-horizontal');
    carousel.style.transition = `transform ${intervalTime}ms linear`;

    spinningInterval.current = setInterval(() => {
      setActiveCarousel('horizontal');
      setHorizontalIndex((prevIndex) => {
        // Apply a small rotation per interval in the specified direction
        const newRotation =
          direction === 'right'
            ? prevIndex + rotationStep
            : prevIndex - rotationStep;
        carousel.style.transform = `rotateY(${newRotation}deg)`;
        return newRotation;
      });
    }, intervalTime); // Apply smaller rotations at a higher frequency
  };

  // Vertically spinning function
  // const startSpinningVertical = (direction) => {
  //   if (spinningIntervalVertical.current) return; // Prevent multiple intervals
  //   setIsSpinningVertical(true);

  //   const carousel = document.querySelector('.carousel-vertical');
  //   carousel.style.transition = `transform ${VerticalIntervalTime}ms linear`;

  //   spinningIntervalVertical.current = setInterval(() => {
  //     setVerticalIndex((prevIndex) => {
  //       const newRotation =
  //         direction === 'up'
  //           ? prevIndex - rotationStep
  //           : prevIndex + rotationStep;
  //       carousel.style.transform = `rotateX(${
  //         newRotation * -rotationPerPanel
  //       }deg)`;
  //       return newRotation;
  //     });
  //   }, VerticalIntervalTime);
  // };

  // Horizantally Adjust stopSpinning to remove CSS transition smoothly
  const stopSpinning = () => {
    setIsSpinning(false);
    clearInterval(spinningInterval.current);
    spinningInterval.current = null;

    // console.log("continuous_Spinning_Direction: ", continuous_Spinning_Direction)

    if (continuous_Spinning_Direction === 'right') {
      setHorizontalIndex(horizontalIndex - 1);
    } else if (continuous_Spinning_Direction === 'left') {
      setHorizontalIndex(horizontalIndex + 1);
    } else {
      continuous_Spinning_Direction = '';
    }
  };

  // vertically stop Spinning function
  const stopSpinningVertical = () => {
    setIsSpinningVertical(false);
    clearInterval(spinningIntervalVertical.current);
    spinningIntervalVertical.current = null;
  };

  // Handle click event to stop spinning
  const handleCarouselClick = (e) => {

// Check if the click target or its parents contain a video element
const isVideoClick = e.target.closest('.relative.w-full.h-full.cursor-pointer');


    if (isSpinningVertical || isSpinning) {
      if (isSpinning) stopSpinning();
      if (isSpinningVertical) stopSpinningVertical();
    } else {
      if (!isVideoClick) {
          console.log("no video found!")
        //   return false;
      }
    }
  };

  // --- select one of the carousel product -----
  const handleCarouselProduct = (product) => {
    setHorizontalIndex(product);
    // setGallery((prev) => !prev)
  };

  // Function to update the state based on the screen width
  const checkScreenWidth = () => {
    const screenWidth = window.innerWidth;
    if (screenWidth > 390) {
      setIsMobileWidth(true);
    } else {
      setIsMobileWidth(false);
    }
  };

  // useEffect(() => {
  //   FilteringCollectionsAndProducts(filteredCategory);
  // }, [filteredCategory]);


  // Clean up interval on unmount and add global mouse listeners
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      if (isMouseDown) {
        handleMouseUp();
      }
    };

    const handleGlobalMouseMove = (e) => {
      if (isMouseDown) {
        const currentX = e.clientX;
        const currentY = e.clientY;
        const deltaX = currentX - mouseStartX;
        const deltaY = currentY - mouseStartY;
        setMouseDeltaX(deltaX);
        setMouseDeltaY(deltaY);
      }
    };

    document.addEventListener('mouseup', handleGlobalMouseUp);
    document.addEventListener('mousemove', handleGlobalMouseMove);
    
    return () => {
      clearInterval(spinningInterval.current);
      document.removeEventListener('mouseup', handleGlobalMouseUp);
      document.removeEventListener('mousemove', handleGlobalMouseMove);
    };
  }, [isMouseDown, mouseStartX, mouseStartY]);

  // ----------- Below is the video related logic -------------------
  const videoRefs = useRef([]);

  const handleVideoFullscreen = (productId) => {
    // dispatch(handleFeaturePage(false));
    const video = videoRefs.current[productId];
    if (!video) {
      console.log("No video element found for productId:", productId);
      return;
    }
    video.style.display = 'block';
    if (video.requestFullscreen) {
      video.requestFullscreen();
    } else if (video.webkitRequestFullscreen) {
      video.webkitRequestFullscreen();
    } else if (video.msRequestFullscreen) {
      video.msRequestFullscreen();
    }
    video.play().catch(error => {
      console.error("Error playing video:", error);
    });
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        Object.values(videoRefs.current).forEach((video) => {
          if (video) {
            console.log(`Pausing video at index ${video.id}`);
            video.pause();
            video.style.display = 'none';
          }
        });
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);


  //------- Below is the func method to create dynamic product array by removing and adding products based on the spinning direction
  const createDynamicProductArray = (items, currentIndex) => {
    if (!items || items.length === 0) {
      return [];
    }
    const totalItems = items.length;
    const PANEL_COUNT = 5; // Cube has 5 visible sides
    const totalPages = Math.ceil(totalItems / PANEL_COUNT); // Total number of pages

    const normalizedIndex = currentIndex % 5;
    // console.log("Total Items:", totalItems, "Total Pages:", totalPages);

    // Determine current page index
    const currentPage = Math.floor(currentIndex / PANEL_COUNT) % totalPages;
    if (totalItems === 0) return [];

    // Helper function for circular indexing
    const getCircularIndex = (index) => (index + totalItems) % totalItems;

    // Determine if a shift should occur (only when currentIndex % 5 === 4)
    const shiftTriggerLeft = normalizedIndex === 0 && currentIndex % 5 == 0;
    const shiftTriggerRight = normalizedIndex === 4;

    // Compute start index for the page shift
    let startIndex = currentPage * PANEL_COUNT;

    // Extract the relevant products dynamically to always get 5 elements
    const result = [];
    for (let i = 0; i < 5; i++) {
      result.push(items[getCircularIndex(startIndex + i)]);
    }

    // If shiftTrigger is true, replace the last element with the first element of the next page
    if (shiftTriggerRight) {
      let nextPageStartIndex = (startIndex + PANEL_COUNT) % totalItems;
      // let nextPageStartIndex =getCircularIndex(startIndex + startIndex *(currentPage+1));
      // console.log("nextPageStartIndex",nextPageStartIndex)
      // console.log(items)
      result[0] = items[nextPageStartIndex];
    }
    if (shiftTriggerLeft) {
      let prevPageStartIndex = totalItems - (startIndex + 1);
      // let prevPageStartIndex = startIndex === 0 ? getCircularIndex(totalItems - (currentPage+1)) : getCircularIndex(startIndex - PANEL_COUNT*(pageNumber+1));
      // console.log("prevPageStartIndex",prevPageStartIndex)
      // console.log(items)
      result[4] = items[prevPageStartIndex];
    }
    // console.log("startIndex",startIndex);
    // console.log("currentPages",currentPage);
    // console.log("normalizedIndex",normalizedIndex);
    // console.log("Current Index:", currentIndex);
    // console.log("Shift Triggered Left:", shiftTriggerLeft);
    // console.log("Shift Triggered Right:", shiftTriggerRight);
    // console.log("Final Result (Cube Faces):", result);

    return result;
  };

  const totalItems = products?.length || 0;
  const activeProductIndex =
    totalItems > 0
      ? ((horizontalIndex % totalItems) + totalItems) % totalItems
      : 0;
  const activeProduct = products?.[activeProductIndex];

  const totalCollections = collectionsData?.length || 0;
  const activeCollectionIndex =
    totalCollections > 0
      ? ((horizontalIndex % totalCollections) + totalCollections) %
        totalCollections
      : 0;
  const activeCollection = collectionsData?.[activeCollectionIndex];

  const dynamicProductsArray =
    products?.length > 5
      ? createDynamicProductArray(products, activeProductIndex)
      : createNonDuplicateOrder(products);

  const dynamicCollectionsArray =
    collectionsData?.length > 5
      ? createDynamicProductArray(collectionsData, activeCollectionIndex)
      : createNonDuplicateOrder(collectionsData);

  let yAxisItems = [];
  if (yAxisDisplayMode === 'variants') {
    if (activeProduct?.variants && activeProduct.variants.length > 0) {
      yAxisItems = activeProduct.variants;
    } else if (activeProduct) {
      yAxisItems = [
        {
          id: 'featured-' + activeProduct.id,
          image: {
            url: activeProduct.featuredImage,
            altText: activeProduct.title,
          },
        },
      ];
    }
  } else {
    if (activeCollection?.products && activeCollection.products.length > 0) {
      yAxisItems = activeCollection.products;
    }
  }

  const currentProductVariants = duplicateVerticalPanels(yAxisItems || []);

  // console.log("currentProduct.variants >>> ", currentProductVariants);
  var variantCounts = 0;

  if (products[horizontalIndex]?.variants?.length < 5) {
    variantCounts =
      verticalIndex >= 0
        ? (verticalIndex % 5) % products[horizontalIndex].variants?.length
        : (verticalIndex % 5) % products[horizontalIndex].variants?.length +
          products[horizontalIndex].variants?.length;
  } else {
    variantCounts =
      verticalIndex >= 0
        ? verticalIndex % currentProductVariants?.length
        : ((verticalIndex % currentProductVariants?.length) +
            currentProductVariants?.length) %
          currentProductVariants?.length;
  }

  // Add effect to update products when levelProducts changes
  useEffect(() => {
   
      setproducts(productsList);
    
  }, [productsList]);


console.log("dynamic-product array >>> ", dynamicProductsArray)


  return (
    <>
      <style jsx>{`
        .carousel-container * {
          user-select: none !important;
          -webkit-user-select: none !important;
          -moz-user-select: none !important;
          -ms-user-select: none !important;
          outline: none !important;
          -webkit-tap-highlight-color: transparent !important;
        }
        .carousel-container:focus {
          outline: none !important;
        }
        .carousel-panel:focus {
          outline: none !important;
        }
        .panel-content:focus {
          outline: none !important;
        }
      `}</style>
      <div className="w-full h-full ">
        {/* ---- BELOW CODE IS FOR SPINNING TOOL AND other top buttons */}
        <div
          className={`parent w-full   z-10 ${
            isMobileWidth
              ? IsDisplaySubCarousel
                ? 'h-[76%]'
                : 'h-[80vh]'
              : IsDisplaySubCarousel
              ? 'h-[70%]'
              : 'h-[77%]'
          }     ${
            isDarkMode ? 'bg-[#000000]' : 'bg-backgroundColortool'
          }  overflow-hidden`}
        >

          <div className="spinturea-container w-full flex flex-col h-[88%]  relative  ">
            <div
              className=" relative w-full h-full flex flex-row overflow-hidden "
              id="center"
              style={{
                position: 'relative',
                zIndex: 1,
              }}
            >
              {/* =============== Below is the product spinning tools =============== */}
              <div
                className="carousel-container relative flex w-full "
                style={{
                  position: 'relative',
                  width: '100%',
                  height: '100%',
                  perspective: '1000px',
                  touchAction: 'none', // Disable browser's default touch actions
                  cursor: 'grab',
                  userSelect: 'none', // Prevent text selection
                  WebkitUserSelect: 'none',
                  MozUserSelect: 'none',
                  msUserSelect: 'none',
                  outline: 'none', // Remove focus outline
                }}
                onTouchStart={!IsShowProductDesc ? handleTouchStart : null}
                onTouchMove={!IsShowProductDesc ? handleTouchMove : null}
                onTouchEnd={!IsShowProductDesc ? handleTouchEnd : null}
                onMouseDown={!IsShowProductDesc ? handleMouseDown : null}
                onMouseUp={!IsShowProductDesc ? handleMouseUp : null}
                onMouseLeave={!IsShowProductDesc ? handleMouseUp : null} // Handle mouse leaving the container
                onClick={!IsShowProductDesc ? handleCarouselClick : null} // Add click handler to stop spinning
                onSelectStart={(e) => e.preventDefault()} // Prevent text selection
                onDragStart={(e) => e.preventDefault()} // Prevent drag
                tabIndex={-1} // Remove from tab order
               
              >
                {noProductsFound ? (
                  <div className="no-products-message bg-gray-200  w-full h-[70%] flex justify-center items-center  text-base font-semibold  text-red-600">
                    <h2 className="py-8">Oops! No products found.</h2>
                  </div>
                ) : (
                  <>
                    {/* Vertical carousel (rotate around X-axis) */}
                    <div
                      className={`carousel-vertical w-full h-full `}
                      style={{
                        width: '100%',
                        height: '100%',
                        position: 'absolute',
                        transformStyle: 'preserve-3d',
                        transition: 'transform 1.3s ease-in-out',
                        zIndex: activeCarousel === 'vertical' ? 2 : 1,
                        transform: `rotateX(${
                          verticalIndex * -rotationPerPanel
                        }deg)`,
                      }}
                    >
                      {currentProductVariants?.map((item, index) => {
                        const rotateAngle = index * rotationPerPanel;


                        return (
                          <div
                            className={`carousel-panel`}
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
                              userSelect: 'none',
                              WebkitUserSelect: 'none',
                              MozUserSelect: 'none',
                              msUserSelect: 'none',
                              outline: 'none',
                              cursor: 'grab',
                            }}
                          >
                            <div
                              className={`panel-content ${
                                isMobileWidth
                                  ? 'w-[16.5rem] h-[17.1rem]'
                                  : ' w-[13.2rem] h-[13.8rem]'
                              } `}
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
                                  filter: isSpinning ? 'blur(13px)' : 'none',
                                }}
                                src={
                                  yAxisDisplayMode === 'variants'
                                    ? item?.image?.url
                                    : item.featuredImage?.url || item.featuredImage
                                }
                                alt="vertical-carousel-img"
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
                        transform: `rotateY(${
                          horizontalIndex * -rotationPerPanel
                        }deg)`,
                      }}
                    >
                      {yAxisDisplayMode === 'variants'
                        ? dynamicProductsArray?.map((item, index) => {
                            const rotateAngle = index * rotationPerPanel;

                            // Find the first video in the media array (if any)
                            const videoMedia = item?.media?.find(
                              (mediaItem) => mediaItem.type === 'video',
                            );

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
                                    isMobileWidth
                                      ? 'w-[16.5rem] h-[17.1rem]'
                                      : ' w-[13.2rem] h-[13.8rem]'
                                  } `}
                                  style={{
                                    background: '#979494',
                                    boxShadow:
                                      '0px 3px 3px rgba(0, 0, 0, 0.2)',
                                    objectFit: 'cover',
                                    overflow: 'hidden',
                                    position: 'relative',
                                  }}
                                >
                                  {videoMedia ? (
                                    <>
                                      <img
                                        src={item?.featuredImage}
                                        alt={item?.title}
                                        style={{
                                          objectFit: 'cover',
                                          width: '100%',
                                          height: '100%',
                                        }}
                                      />
                                      <div
                                        className="absolute top-2 right-2 cursor-pointer bg-blue-900 bg-opacity-50 rounded-full p-1"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleVideoFullscreen(item.id);
                                        }}
                                      >
                                        <svg
                                          xmlns="http://www.w3.org/2000/svg"
                                          className="h-8 w-8 text-white"
                                          fill="none"
                                          viewBox="0 0 24 24"
                                          stroke="currentColor"
                                        >
                                          <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M14.752 11.168l-5.197-3.03A1 1 0 008 9.03v5.939a1 1 0 001.555.832l5.197-3.03a1 1 0 000-1.664z"
                                          />
                                        </svg>
                                      </div>
                                      <video
                                        ref={(ref) => {
                                          if (ref)
                                            videoRefs.current[item.id] = ref;
                                        }}
                                        controls
                                        style={{display: 'none'}}
                                      >
                                        <source
                                          src={videoMedia?.sources[0]?.url}
                                          type="video/mp4"
                                        />
                                        Your browser does not support the video
                                        tag.
                                      </video>
                                    </>
                                  ) : (
                                    <img
                                      src={item?.featuredImage?.url}
                                      alt={item?.title}
                                      style={{
                                        objectFit: 'cover',
                                        width: '100%',
                                        height: '100%',
                                      }}
                                    />
                                  )}
                                </div>
                              </div>
                            );
                          })
                        : dynamicCollectionsArray?.map((item, index) => {
                            const rotateAngle = index * rotationPerPanel;
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
                                    isMobileWidth
                                      ? 'w-[16.5rem] h-[17.1rem]'
                                      : ' w-[13.2rem] h-[13.8rem]'
                                  } `}
                                  style={{
                                    background: '#979494',
                                    boxShadow:
                                      '0px 3px 3px rgba(0, 0, 0, 0.2)',
                                    objectFit: 'cover',
                                    overflow: 'hidden',
                                    position: 'relative',
                                  }}
                                >
                                  <img
                                    src={item?.image?.url}
                                    alt={item?.title}
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
                  </>
                )}
              </div>

            </div>
          </div>

          {/* ----- active product name + description to be display at the bottom --------- */}
          <div
            className={` ${
              isMobileWidth ? '-mt-14' : '-mt-12'
            } w-full flex flex-col gap-2 justify-center  items-center`}
          >
            <p className="text-white text-center text-base leading-3">
              {activeProduct?.title}
            </p>
            <p className="text-white text-center text-base leading-3">
              {activeProduct?.description?.substring(0, 40) + ' ...'}
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

