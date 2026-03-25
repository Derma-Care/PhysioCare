// availabilityService.js
import axios from 'axios';
import { doctorAvailableUrl } from './BaseUrl'; // same style as your Dart version
import { http } from '../../Utils/Interceptors';

const availabilityService = {
  updateAvailability: async (doctorId, isAvailable) => {
    try {
      const url = `${doctorAvailableUrl}/${doctorId}`;
      console.log("updateAvailability:", doctorId, isAvailable);

      const response = await http.put(
        url,
        { doctorAvailabilityStatus: isAvailable },
        { headers: { "Content-Type": "application/json" } }
      );

      console.log("updateAvailability response:", response.data);

      return response.status === 200;
    } catch (error) {
      console.error("❌ Error updating availability:", error);
      return false;
    }
  }
};

export default availabilityService;
