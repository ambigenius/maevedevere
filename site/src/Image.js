import React from 'react';
import './App.css';

class Image extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      currentIndex: 0,
      isHovered: false,
    };
  }

  componentDidUpdate(prevProps) {
    if (JSON.stringify(prevProps.imageLinks) !== JSON.stringify(this.props.imageLinks)) {
      this.setState({ currentIndex: 0 });
    }
  }

  goToPrevious = (length) => {
    this.setState((prevState) => ({
      currentIndex: prevState.currentIndex === 0 ? length - 1 : prevState.currentIndex - 1,
    }));
  };

  goToNext = (length) => {
    this.setState((prevState) => ({
      currentIndex: (prevState.currentIndex + 1) % length,
    }));
  };

  handleMouseEnter = () => {
    this.setState({ isHovered: true });
  };

  handleMouseLeave = () => {
    this.setState({ isHovered: false });
  };

  getWrapperStyle(maxWidth) {
    const style = {
      width: '100%',
      margin: '0 auto',
    };

    const base = maxWidth && typeof maxWidth === 'string' && maxWidth.trim().length
      ? maxWidth.trim()
      : '720px';

    style.maxWidth = `min(${base}, 100vw)`;

    return style;
  }

  render() {
    const imageLinks = Array.isArray(this.props.imageLinks)
      ? this.props.imageLinks
      : this.props.imageLinks
      ? [this.props.imageLinks]
      : [];

    const { currentIndex, isHovered } = this.state;
    const maxWidth = this.props.imageWidth;
    const wrapperStyle = this.getWrapperStyle(maxWidth);

    if (imageLinks.length === 0) {
      return null;
    }

    if (imageLinks.length === 1) {
      return (
        <div className="image-container" style={wrapperStyle}>
          <img
            src={imageLinks[0]}
            alt="Image"
            className="single-image"
          />
        </div>
      );
    }

    return (
      <div
        className="image-carousel-container"
        style={wrapperStyle}
        onMouseEnter={this.handleMouseEnter}
        onMouseLeave={this.handleMouseLeave}
      >
        <div className="carousel-image-wrapper">
          <img
            src={imageLinks[currentIndex]}
            alt={`Image ${currentIndex + 1} of ${imageLinks.length}`}
            className="carousel-image"
          />

          {isHovered && (
            <button
              className="carousel-arrow carousel-arrow-left"
              onClick={() => this.goToPrevious(imageLinks.length)}
              aria-label="Previous image"
            >
              ‹
            </button>
          )}

          {isHovered && (
            <button
              className="carousel-arrow carousel-arrow-right"
              onClick={() => this.goToNext(imageLinks.length)}
              aria-label="Next image"
            >
              ›
            </button>
          )}

          <div className="carousel-indicators">
            {currentIndex + 1} / {imageLinks.length}
          </div>
        </div>
      </div>
    );
  }
}

export default Image;

