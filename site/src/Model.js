/**
 * Abstract class template with multiple variables
 * Cannot be instantiated directly - must be extended
 */
class Model {
  constructor(data = {}) {
    // Prevent direct instantiation of abstract class
    if (this.constructor === Model) {
      throw new Error('Cannot instantiate abstract class Model');
    }

    // Date value
    this.date = data.date || new Date();
    
    // Title
    this.title = data.title || '';
    
    // Additional common variables
    this.id = data.id || null;
    this.description = data.description || '';
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
    this.isActive = data.isActive ?? true;
    this.metadata = data.metadata || {};
  }

  // Abstract method that must be implemented by subclasses
  validate() {
    throw new Error('validate() must be implemented by subclass');
  }

  // Abstract method that must be implemented by subclasses
  toJSON() {
    throw new Error('toJSON() must be implemented by subclass');
  }

  // Helper method to update the updatedAt timestamp
  touch() {
    this.updatedAt = new Date();
  }

  // Helper method to format date
  getFormattedDate() {
    return this.date.toLocaleDateString();
  }
  getType() { return this.constructor.name; } // "Words" | "Lines" | "Motion<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<" | "Sound" | "About"

}

/**
 * Words class extending Model
 * Represents a text content entry with markdown support
 */
class Words extends Model {
  constructor(data = {}) {
    super(data);
    
    // Markdown text field
    this.text = data.text || '';
  }

  // Validate the Words instance
  validate() {
    const errors = [];
    
    if (!this.title || this.title.trim() === '') {
      errors.push('Title is required');
    }
    
    if (!this.date || !(this.date instanceof Date)) {
      errors.push('Valid date is required');
    }
    
    if (errors.length > 0) {
      return { isValid: false, errors };
    }
    
    return { isValid: true, errors: [] };
  }

  // Convert to JSON representation
  toJSON() {
    return {
      type: this.getType(),
      id: this.id,
      title: this.title,
      date: this.date.toISOString(),
      text: this.text,
      description: this.description,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
      isActive: this.isActive,
      metadata: this.metadata
    };
  }
}

/**
 * Lines class extending Model
 * Represents a content entry with markdown text and image support
 */
class Lines extends Model {
  constructor(data = {}) {
    super(data);
    
    // Markdown text field
    this.text = data.text || '';
    
    // Image object - can accept single image link (string) or multiple (array)
    // This stores the imageLinks data that will be used with the Image component
    this.image = data.image || null;
    
    // Optional image width (defaults to Image component's default)
    this.imageWidth = data.imageWidth || '600px';
  }

  // Validate the Lines instance
  validate() {
    const errors = [];
    
    if (!this.title || this.title.trim() === '') {
      errors.push('Title is required');
    }
    
    if (!this.date || !(this.date instanceof Date)) {
      errors.push('Valid date is required');
    }
    
    if (errors.length > 0) {
      return { isValid: false, errors };
    }
    
    return { isValid: true, errors: [] };
  }

  // Convert to JSON representation
  toJSON() {
    return {
      type: this.getType(),
      id: this.id,
      title: this.title,
      date: this.date.toISOString(),
      text: this.text,
      image: this.image,
      imageWidth: this.imageWidth,
      description: this.description,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
      isActive: this.isActive,
      metadata: this.metadata
    };
  }

  // Helper method to get image links as array (for Image component compatibility)
  getImageLinks() {
    if (!this.image) {
      return null;
    }
    
    return Array.isArray(this.image) ? this.image : [this.image];
  }
}

/**
 * Motion class extending Model
 * Represents a content entry with markdown text and video support
 */
class Motion extends Model {
  constructor(data = {}) {
    super(data);
    
    // Markdown text field
    this.text = data.text || '';
    
    // Video link - URL to hosted video file
    this.videoUrl = data.videoUrl || null;
  }

  // Validate the Motion instance
  validate() {
    const errors = [];
    
    if (!this.title || this.title.trim() === '') {
      errors.push('Title is required');
    }
    
    if (!this.date || !(this.date instanceof Date)) {
      errors.push('Valid date is required');
    }
    
    if (this.videoUrl && typeof this.videoUrl !== 'string') {
      errors.push('Video URL must be a valid string');
    }
    
    if (errors.length > 0) {
      return { isValid: false, errors };
    }
    
    return { isValid: true, errors: [] };
  }

  // Convert to JSON representation
  toJSON() {
    return {
      type: this.getType(),
      id: this.id,
      title: this.title,
      date: this.date.toISOString(),
      text: this.text,
      videoUrl: this.videoUrl,
      description: this.description,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
      isActive: this.isActive,
      metadata: this.metadata
    };
  }
}

/**
 * Sound class extending Model
 * Represents a content entry with markdown text, image support, and audio link
 */
class Sound extends Model {
  constructor(data = {}) {
    super(data);
    
    // Markdown text field
    this.text = data.text || '';
    
    // Image object - can accept single image link (string) or multiple (array)
    // This stores the imageLinks data that will be used with the Image component
    this.image = data.image || null;
    
    // Optional image width (defaults to Image component's default)
    this.imageWidth = data.imageWidth || '600px';
    
    // Audio URL - link to hosted audio (Bandcamp, SoundCloud, etc.)
    this.audioUrl = data.audioUrl || null;
  }

  // Validate the Sound instance
  validate() {
    const errors = [];
    
    if (!this.title || this.title.trim() === '') {
      errors.push('Title is required');
    }
    
    if (!this.date || !(this.date instanceof Date)) {
      errors.push('Valid date is required');
    }
    
    if (errors.length > 0) {
      return { isValid: false, errors };
    }
    
    return { isValid: true, errors: [] };
  }

  // Convert to JSON representation
  toJSON() {
    return {
      type: this.getType(),
      id: this.id,
      title: this.title,
      date: this.date.toISOString(),
      text: this.text,
      image: this.image,
      imageWidth: this.imageWidth,
      audioUrl: this.audioUrl,
      description: this.description,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
      isActive: this.isActive,
      metadata: this.metadata
    };
  }

  // Helper method to get image links as array (for Image component compatibility)
  getImageLinks() {
    if (!this.image) {
      return null;
    }
    
    return Array.isArray(this.image) ? this.image : [this.image];
  }
}

/**
 * About class extending Model
 * Represents an about section with markdown text support
 */
class About extends Model {
  constructor(data = {}) {
    super(data);
    
    // Markdown text field
    this.text = data.text || '';
  }

  // Validate the About instance
  validate() {
    const errors = [];
    
    if (!this.title || this.title.trim() === '') {
      errors.push('Title is required');
    }
    
    if (!this.date || !(this.date instanceof Date)) {
      errors.push('Valid date is required');
    }
    
    if (errors.length > 0) {
      return { isValid: false, errors };
    }
    
    return { isValid: true, errors: [] };
  }

  // Convert to JSON representation
  toJSON() {
    return {
      type: this.getType(),
      id: this.id,
      title: this.title,
      date: this.date.toISOString(),
      text: this.text,
      description: this.description,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
      isActive: this.isActive,
      metadata: this.metadata
    };
  }
}

export default Model;
export { Words, Lines, Motion, Sound, About };

