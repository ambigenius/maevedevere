import React from 'react';
import './App.css';

/**
 * Image component that handles both single and multiple images
 * - Single image: displays as standardized fixed-width image
 * - Multiple images: creates carousel/slideshow with navigation arrows
 */
class Image extends React.Component {
  constructor(props) {
    super(props);
    
    // Normalize image links: convert single string to array, or use array as-is
    this.imageLinks = Array.isArray(props.imageLinks) 
      ? props.imageLinks 
      : (props.imageLinks ? [props.imageLinks] : []);
    
    // Fixed width for all images
    this.imageWidth = props.imageWidth || '600px';
    
    // State for carousel current index
    this.state = {
      currentIndex: 0,
      isHovered: false
    };
  }

  // Navigate to previous image
  goToPrevious = () => {
    this.setState(prevState => ({
      currentIndex: prevState.currentIndex === 0 
        ? this.imageLinks.length - 1 
        : prevState.currentIndex - 1
    }));
  };

  // Navigate to next image
  goToNext = () => {
    this.setState(prevState => ({
      currentIndex: (prevState.currentIndex + 1) % this.imageLinks.length
    }));
  };

  // Handle mouse enter
  handleMouseEnter = () => {
    this.setState({ isHovered: true });
  };

  // Handle mouse leave
  handleMouseLeave = () => {
    this.setState({ isHovered: false });
  };

  render() {
    const { currentIndex, isHovered } = this.state;
    const { imageLinks, imageWidth } = this;

    // If no images, return null
    if (imageLinks.length === 0) {
      return null;
    }

    // Single image display
    if (imageLinks.length === 1) {
      return (
        <div className="image-container">
          <img 
            src={imageLinks[0]} 
            alt="Image"
            className="single-image"
            style={{ width: imageWidth }}
          />
        </div>
      );
    }

    // Carousel display for multiple images
    return (
      <div 
        className="image-carousel-container"
        onMouseEnter={this.handleMouseEnter}
        onMouseLeave={this.handleMouseLeave}
        style={{ width: imageWidth }}
      >
        <div className="carousel-image-wrapper">
          <img 
            src={imageLinks[currentIndex]} 
            alt={`Image ${currentIndex + 1} of ${imageLinks.length}`}
            className="carousel-image"
            style={{ width: imageWidth }}
          />
          
          {/* Previous arrow - only visible on hover */}
          {isHovered && (
            <button 
              className="carousel-arrow carousel-arrow-left"
              onClick={this.goToPrevious}
              aria-label="Previous image"
            >
              ‹
            </button>
          )}
          
          {/* Next arrow - only visible on hover */}
          {isHovered && (
            <button 
              className="carousel-arrow carousel-arrow-right"
              onClick={this.goToNext}
              aria-label="Next image"
            >
              ›
            </button>
          )}
          
          {/* Image counter/indicators */}
          <div className="carousel-indicators">
            {currentIndex + 1} / {imageLinks.length}
          </div>
        </div>
      </div>
    );
  }
}

export default Image;

