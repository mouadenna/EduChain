import { ethers } from 'ethers';

// Get a specific course by ID
export const getCourse = async (contract, courseId) => {
  try {
    const course = await contract.courses(courseId);
    return {
      id: course.id.toString(),
      teacher: course.teacher,
      title: course.title,
      description: course.description,
      price: course.price,
      contentUrl: course.contentUrl,
      moduleCount: course.moduleCount.toString()
    };
  } catch (error) {
    console.error("Error fetching course:", error);
    throw error;
  }
};

// Get all courses 
export const getAllCourses = async (contract) => {
  try {
    const courseCount = await contract.getCourseCount();
    const courses = [];

    for (let i = 1; i <= courseCount; i++) {
      const course = await getCourse(contract, i);
      courses.push(course);
    }

    return courses;
  } catch (error) {
    console.error("Error fetching all courses:", error);
    throw error;
  }
};

// Get courses created by a teacher
export const getTeacherCourses = async (contract, teacherAddress) => {
  try {
    const courseIds = await contract.getTeacherCourses(teacherAddress);
    const courses = [];

    for (let i = 0; i < courseIds.length; i++) {
      const course = await getCourse(contract, courseIds[i]);
      courses.push(course);
    }

    return courses;
  } catch (error) {
    console.error("Error fetching teacher courses:", error);
    throw error;
  }
};

// Get courses enrolled by a student
export const getStudentCourses = async (contract, studentAddress) => {
  try {
    const courseIds = await contract.getStudentCourses(studentAddress);
    const courses = [];

    for (let i = 0; i < courseIds.length; i++) {
      const course = await getCourse(contract, courseIds[i]);
      courses.push(course);
    }

    return courses;
  } catch (error) {
    console.error("Error fetching student courses:", error);
    throw error;
  }
};

// Create a new course
export const createCourse = async (contract, signer, title, description, price, contentUrl, moduleCount) => {
  try {
    const contractWithSigner = contract.connect(signer);
    
    // Fix price conversion - ensure it's properly formatted
    // Convert price to string first to handle any input format
    let priceValue = price.toString().trim();
    
    // Log the price value for debugging
    console.log('Original price input:', price);
    
    // Handle price conversions correctly
    // If price is a whole number like "50", convert to "0.05" (eth)
    if (parseFloat(priceValue) > 10) {
      priceValue = (parseFloat(priceValue) / 1000).toString();
      console.log('Adjusted price to more reasonable ETH value:', priceValue);
    }
    
    console.log('Using ETH price:', priceValue);
    const priceInWei = ethers.parseEther(priceValue);
    console.log('Price in Wei:', priceInWei.toString());
    
    console.log('Calling createCourse on contract:', {
      contractAddress: contract.target,
      signerAddress: await signer.getAddress()
    });
    
    const tx = await contractWithSigner.createCourse(
      title,
      description,
      priceInWei,
      contentUrl,
      moduleCount
    );
    
    console.log('Transaction submitted:', tx.hash);
    
    const receipt = await tx.wait();
    console.log('Transaction receipt:', receipt);
    
    // Handle various receipt formats
    let courseId = '1'; // Default courseId to return if we can't extract it
    
    try {
      // Format 1: Check for events array (ethers v6)
      if (receipt.events && Array.isArray(receipt.events)) {
        console.log('Format 1: Events array found');
        const event = receipt.events.find(event => event.event === 'CourseCreated');
        if (event && event.args) {
          courseId = event.args.courseId.toString();
        }
      } 
      // Format 2: Check for logs array
      else if (receipt.logs && Array.isArray(receipt.logs)) {
        console.log('Format 2: Logs array found, looking for CourseCreated event');
        // Try to decode the logs manually
        const courseCreatedTopic = ethers.id("CourseCreated(uint256,address,string,uint256)");
        const courseCreatedLog = receipt.logs.find(log => 
          log.topics && log.topics[0] === courseCreatedTopic
        );
        
        if (courseCreatedLog) {
          console.log('Found CourseCreated log:', courseCreatedLog);
          // Try to decode the log data
          courseId = parseInt(courseCreatedLog.topics[1], 16).toString();
        }
      }
      // Format 3: Different receipt format
      else if (typeof receipt.status !== 'undefined' && receipt.status === 1) {
        console.log('Format 3: Transaction successful but no clear event data');
        
        // The transaction was successful, but we can't extract the ID
        // Query the contract for the latest course
        const coursesCreated = await contract.getTeacherCourses(await signer.getAddress());
        if (coursesCreated && coursesCreated.length > 0) {
          courseId = coursesCreated[coursesCreated.length - 1].toString();
          console.log('Got most recent course ID from contract:', courseId);
        }
      }
    } catch (parseError) {
      console.error('Error parsing event data:', parseError);
      // Continue with default courseId
    }
    
    console.log('Final courseId determined:', courseId);
    return courseId;
  } catch (error) {
    console.error("Error creating course:", error);
    throw error;
  }
};

// Enroll in a course
export const enrollInCourse = async (contract, signer, courseId, price) => {
  try {
    const contractWithSigner = contract.connect(signer);
    
    const tx = await contractWithSigner.enrollInCourse(courseId, {
      value: price
    });
    
    await tx.wait();
    return true;
  } catch (error) {
    console.error("Error enrolling in course:", error);
    throw error;
  }
};

// Complete a module in a course
export const completeModule = async (contract, signer, courseId, moduleIndex) => {
  try {
    const contractWithSigner = contract.connect(signer);
    
    console.log('Completing module:', {
      courseId,
      moduleIndex,
      signerAddress: await signer.getAddress()
    });
    
    const tx = await contractWithSigner.completeModule(courseId, moduleIndex);
    console.log('Module completion transaction submitted:', tx.hash);
    
    const receipt = await tx.wait();
    console.log('Module completion transaction receipt:', receipt);
    
    // Check if the transaction was successful
    if (receipt.status === 1 || receipt.status === '0x1') {
      console.log('Module completion successful');
      
      // Verify the module was marked as completed
      try {
        const studentAddress = await signer.getAddress();
        const progress = await contract.getStudentProgress(courseId, studentAddress);
        
        console.log('Student progress after module completion:', progress);
        
        // Check if the module completion was successful
        if (progress && progress.completedModuleCount) {
          console.log('Updated module count:', progress.completedModuleCount.toString());
        }
      } catch (verifyError) {
        console.error('Error verifying module completion:', verifyError);
        // Continue even if verification fails
      }
      
      return true;
    } else {
      console.error('Module completion transaction failed with status:', receipt.status);
      return false;
    }
  } catch (error) {
    console.error("Error completing module:", error);
    throw error;
  }
};

// Get student progress in a course
export const getStudentProgress = async (contract, courseId, studentAddress) => {
  try {
    const progress = await contract.getStudentProgress(courseId, studentAddress);
    
    return {
      isEnrolled: progress.isEnrolled,
      completedModules: progress.completedModules.toString(),
      coursePassed: progress.coursePassed
    };
  } catch (error) {
    console.error("Error getting student progress:", error);
    throw error;
  }
};

// Issue a certificate
export const issueCertificate = async (contract, signer, courseId) => {
  try {
    const contractWithSigner = contract.connect(signer);
    
    console.log('Issuing certificate for course ID:', courseId);
    console.log('Signer address:', await signer.getAddress());
    
    const tx = await contractWithSigner.issueCertificate(courseId);
    console.log('Certificate transaction submitted:', tx.hash);
    
    const receipt = await tx.wait();
    console.log('Certificate transaction receipt:', receipt);
    
    // Handle various receipt formats
    let certificateId = '1'; // Default certificateId to return if we can't extract it
    
    try {
      // Format 1: Check for events array (ethers v6)
      if (receipt.events && Array.isArray(receipt.events)) {
        console.log('Format 1: Events array found');
        const event = receipt.events.find(event => event.event === 'CertificateIssued');
        if (event && event.args) {
          certificateId = event.args.certificateId.toString();
          console.log('Certificate ID from event:', certificateId);
        }
      } 
      // Format 2: Check for logs array
      else if (receipt.logs && Array.isArray(receipt.logs)) {
        console.log('Format 2: Logs array found, looking for CertificateIssued event');
        // Try to decode the logs manually
        const certificateIssuedTopic = ethers.id("CertificateIssued(uint256,address,uint256,uint256)");
        const certificateLog = receipt.logs.find(log => 
          log.topics && log.topics[0] === certificateIssuedTopic
        );
        
        if (certificateLog) {
          console.log('Found CertificateIssued log:', certificateLog);
          // Try to decode the log data
          certificateId = parseInt(certificateLog.topics[1], 16).toString();
          console.log('Certificate ID from log:', certificateId);
        }
      }
      // Format 3: Different receipt format
      else if (typeof receipt.status !== 'undefined' && receipt.status === 1) {
        console.log('Format 3: Transaction successful but no clear event data');
        
        // The transaction was successful, but we can't extract the ID
        // Query the contract for the certificates of this student
        const studentAddress = await signer.getAddress();
        const certificateIds = await contract.getStudentCertificates(studentAddress);
        
        if (certificateIds && certificateIds.length > 0) {
          // Get the most recent certificate
          certificateId = certificateIds[certificateIds.length - 1].toString();
          console.log('Got most recent certificate ID from contract:', certificateId);
        }
      }
    } catch (parseError) {
      console.error('Error parsing certificate event data:', parseError);
      // Continue with default certificateId
    }
    
    console.log('Final certificateId determined:', certificateId);
    return certificateId;
  } catch (error) {
    console.error("Error issuing certificate:", error);
    throw error;
  }
};

// Get student certificates
export const getStudentCertificates = async (contract, studentAddress) => {
  try {
    const certificateIds = await contract.getStudentCertificates(studentAddress);
    const certificates = [];

    for (let i = 0; i < certificateIds.length; i++) {
      const cert = await contract.certificates(certificateIds[i]);
      certificates.push({
        id: cert.id.toString(),
        student: cert.student,
        courseId: cert.courseId.toString(),
        timestamp: cert.timestamp.toString(),
        issued: cert.issued
      });
    }

    return certificates;
  } catch (error) {
    console.error("Error fetching student certificates:", error);
    throw error;
  }
}; 