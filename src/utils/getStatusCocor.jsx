export const getStatusCocor = (status) => {
    switch(status) {
        case "Not Process": return "bg-gray-200";
        case "Processing": return "bg-blue-200";
        case "Completed": return "bg-blue-500";
        case "Cancelled": return "bg-red-200";
        default: return "";
    }
};