const mongoose = require('mongoose');

const topicSchema = new mongoose.Schema({
  force: {
    type: String,
    required: [true, 'The law enforcement force is required'],
    enum: ['Policía Nacional', 'Guardia Civil'],
    trim: true
  },
  topicTitle: {
    type: String,
    required: [true, 'The main topic title is required'],
    trim: true
  },
  subtopicTitle: {
    type: String,
    required: [true, 'The subtopic title is required'],
    trim: true
  },
  callYear: {
    type: String,
    required: [true, 'The call/convocatoria year is required'],
    trim: true
  },
  textContent: {
    type: String,
    required: [true, 'The actual text content of the topic is required']
  }
}, {
  timestamps: true 
});

module.exports = mongoose.model('Topic', topicSchema);