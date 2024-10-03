import { getScrapeDateString } from "@/utils/db/handlers";
import { useRouter } from "next/router";
import { Scrape } from "@/utils/interfaces";

interface ScrapeProps {
  scrape: Scrape;
}

const getScrapeStatusBadge = (status: string): React.ReactNode => {
    switch (status) {
      case "pending":
        return (
          <>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
              {status}
            </span>
          </>
        );
      case "error":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            {status}
          </span>
        );
      case "running":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            {status}
          </span>
        );
      case "done":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            {status}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            {status}
          </span>
        );
    }
};

export default function ScrapeBlock({ scrape }: ScrapeProps) {
  const router = useRouter();
  const dateString = getScrapeDateString(scrape.created);

  const renderFieldPills = () => {
    if (!scrape.fields) return null;
    const fields = scrape.fields.split(',').map(field => field.trim());
    return (
      <div className="flex flex-wrap mt-2">
        {fields.map((field, index) => (
          <span key={index} className="bg-blue-100 text-blue-800 text-xs font-medium mr-2 mb-2 px-2.5 py-0.5 rounded-full">
            {field}
          </span>
        ))}
      </div>
    );
  };
  return (
    <div 
      className="mb-3 cursor-pointer bg-white border border-gray-300 rounded-lg transition-colors duration-300 hover:border-blue-500 w-full"
      key={scrape.id}
      onClick={() => router.push(`/scrape/${scrape.id}`)}
    >
      <div className="p-4">
        <h2 className="text-lg font-semibold mb-2">
          {scrape.url}
        </h2>
        {renderFieldPills()}
        <div className="mb-2">
          <div>{getScrapeStatusBadge(scrape.status)}</div>
        </div>
        <p className="text-sm text-gray-500">
          Click to view details
        </p>
      </div>
    </div>
  );
}
