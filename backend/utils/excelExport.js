const XLSX = require('xlsx');

/**
 * Export data to Excel format
 * @param {Array} data - Array of objects to export
 * @param {String} sheetName - Name of the Excel sheet
 * @returns {Buffer} - Excel file buffer
 */
exports.exportToExcel = (data, sheetName = 'Sheet1') => {
  // Create a new workbook
  const workbook = XLSX.utils.book_new();
  
  // Convert JSON data to worksheet
  const worksheet = XLSX.utils.json_to_sheet(data);
  
  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  
  // Generate buffer
  const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  
  return buffer;
};

/**
 * Export multiple sheets to Excel
 * @param {Array} sheets - Array of {name, data} objects
 * @returns {Buffer} - Excel file buffer
 */
exports.exportMultipleSheets = (sheets) => {
  const workbook = XLSX.utils.book_new();
  
  sheets.forEach(sheet => {
    const worksheet = XLSX.utils.json_to_sheet(sheet.data);
    XLSX.utils.book_append_sheet(workbook, worksheet, sheet.name);
  });
  
  const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  
  return buffer;
};

/**
 * Format user data for Excel export
 * @param {Array} users - Array of user objects
 * @returns {Array} - Formatted data
 */
exports.formatUserDataForExport = (users) => {
  return users.map(user => ({
    'Registration Number': user.collegeRegistrationNumber || 'N/A',
    'Name': user.name,
    'Email': user.email,
    'Phone': user.phone,
    'Student Type': user.studentType || 'N/A',
    'Room Number': user.roomNumber || 'N/A',
    'Department': user.department || 'N/A',
    'Year': user.year || 'N/A',
    'Parent Contact': user.parentContact || 'N/A',
    'Status': user.isActive ? 'Active' : 'Inactive',
    'Registered Date': new Date(user.createdAt).toLocaleDateString()
  }));
};

/**
 * Format attendance data for Excel export
 * @param {Array} attendance - Array of attendance objects
 * @returns {Array} - Formatted data
 */
exports.formatAttendanceDataForExport = (attendance) => {
  return attendance.map(record => ({
    'Student Name': record.student?.name || 'N/A',
    'Registration Number': record.student?.collegeRegistrationNumber || 'N/A',
    'Room Number': record.student?.roomNumber || 'N/A',
    'Date': new Date(record.date).toLocaleDateString(),
    'Meal Type': record.mealType,
    'Check-in Time': new Date(record.timestamp).toLocaleTimeString(),
    'Status': record.status,
    'Verification Method': record.verificationMethod
  }));
};

/**
 * Format order data for Excel export
 * @param {Array} orders - Array of order objects
 * @returns {Array} - Formatted data
 */
exports.formatOrderDataForExport = (orders) => {
  return orders.map(order => ({
    'Order Number': order.orderNumber,
    'Student Name': order.user?.name || 'N/A',
    'Registration Number': order.user?.collegeRegistrationNumber || 'N/A',
    'Total Amount': order.total.toFixed(2),
    'Payment Method': order.paymentMethod,
    'Payment Status': order.paymentStatus,
    'Order Status': order.orderStatus,
    'Order Date': new Date(order.createdAt).toLocaleDateString(),
    'Delivery Type': order.deliveryType
  }));
};

/**
 * Format feedback data for Excel export
 * @param {Array} feedbacks - Array of feedback objects
 * @returns {Array} - Formatted data
 */
exports.formatFeedbackDataForExport = (feedbacks) => {
  return feedbacks.map(feedback => ({
    'Student Name': feedback.isAnonymous ? 'Anonymous' : feedback.user?.name,
    'Category': feedback.category,
    'Subject': feedback.subject,
    'Rating': feedback.rating,
    'Status': feedback.status,
    'Priority': feedback.priority,
    'Submitted Date': new Date(feedback.createdAt).toLocaleDateString(),
    'Response': feedback.adminResponse?.message || 'No response yet'
  }));
};
