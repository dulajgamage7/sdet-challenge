module.exports = {
  // For single file upload tests
  fileUploadData: {
    filename: 'simple-question-training.txt',
    status: {
      unprocessed: 'Unprocessed',
      processed: 'Processed'
    }
  },

  // For multiple file upload tests
  multipleFileUploadData: {
    filenames: [
      'simple-question-training.txt',
      'advanced-questions-training.txt'
    ],
    status: {
      unprocessed: 'Unprocessed',
      processed: 'Processed'
    }
  }
};
