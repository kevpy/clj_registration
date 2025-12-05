import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";

export function UserRegistration() {
  const [formData, setFormData] = useState({
    name: "",
    placeOfResidence: "",
    phoneNumber: "",
    gender: "" as "male" | "female" | "other" | "",
    isFirstTimeGuest: true,
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const registerUser = useMutation(api.users.registerUser);
  const searchResults = useQuery(
    api.users.searchUsers,
    searchTerm.length >= 2 ? { searchTerm, limit: 5 } : "skip"
  );
  const existingUser = useQuery(
    api.users.getUserByPhone,
    formData.phoneNumber.length >= 10 ? { phoneNumber: formData.phoneNumber } : "skip"
  );

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleUserSelect = (user: any) => {
    setFormData({
      name: user.name,
      placeOfResidence: user.placeOfResidence,
      phoneNumber: user.phoneNumber,
      gender: user.gender,
      isFirstTimeGuest: false, // Existing user, so not first time
    });
    setSearchTerm("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.placeOfResidence || !formData.phoneNumber || !formData.gender) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (existingUser) {
      toast.error("User with this phone number already exists");
      return;
    }

    setIsSubmitting(true);
    try {
      await registerUser({
        name: formData.name,
        placeOfResidence: formData.placeOfResidence,
        phoneNumber: formData.phoneNumber,
        gender: formData.gender as "male" | "female" | "other",
        isFirstTimeGuest: formData.isFirstTimeGuest,
      });
      toast.success("User registered successfully!");
      setFormData({
        name: "",
        placeOfResidence: "",
        phoneNumber: "",
        gender: "",
        isFirstTimeGuest: true,
      });
      setSearchTerm("");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Registration failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Register New User</h2>

      {/* User Search */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Search Existing Users
        </label>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Type name to search..."
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        />

        {searchResults && searchResults.length > 0 && (
          <div className="mt-2 bg-white border border-gray-200 rounded-lg shadow-sm">
            {searchResults.map((user) => (
              <button
                key={user._id}
                onClick={() => handleUserSelect(user)}
                className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
              >
                <div className="font-medium text-gray-900">{user.name}</div>
                <div className="text-sm text-gray-500">
                  {user.placeOfResidence} • {user.phoneNumber}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Registration Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Full Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              required
            />
          </div>

          {/* Place of Residence */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Place of Residence *
            </label>
            <input
              type="text"
              value={formData.placeOfResidence}
              onChange={(e) => handleInputChange("placeOfResidence", e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              required
            />
          </div>

          {/* Phone Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number *
            </label>
            <input
              type="tel"
              value={formData.phoneNumber}
              onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${existingUser ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
              required
            />
            {existingUser && (
              <p className="mt-1 text-sm text-red-600">
                User with this phone number already exists
              </p>
            )}
          </div>

          {/* Gender */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Gender *
            </label>
            <select
              value={formData.gender}
              onChange={(e) => handleInputChange("gender", e.target.value)}
              className="select-field"
              required
            >
              <option value="">Select Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>

        {/* First Time Guest */}
        <div className="flex items-center">
          <input
            type="checkbox"
            id="firstTimeGuest"
            checked={formData.isFirstTimeGuest}
            onChange={(e) => handleInputChange("isFirstTimeGuest", e.target.checked)}
            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
          />
          <label htmlFor="firstTimeGuest" className="ml-2 block text-sm text-gray-900">
            First-time guest
          </label>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting || !!existingUser}
            className="px-6 py-2 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? "Registering..." : "Register User"}
          </button>
        </div>
      </form>
    </div>
  );
}
