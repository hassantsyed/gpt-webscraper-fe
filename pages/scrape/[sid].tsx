import NavBar from "@/components/Navbar";
import { useAuth } from "@/components/context/authContext";
// import { useInterval } from "@/components/hooks/useInterval";
import { getScrape } from "@/utils/db/handlers";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { Parser } from 'json2csv';
import { Scrape } from "@/utils/interfaces";

const terminal_status = ["done", "error"];

export const getScrapeDateString = (createdTS: number | null): string => {
    if (!createdTS) {
      return 'Date unavailable';
    }
    
    // Assuming createdTS is in seconds
    const date = new Date(createdTS * 1000);
    
    return date.toLocaleString();
  };

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

export default function Home() {
  const router = useRouter();
  const { authUser, userLoading } = useAuth();
  const { sid } = router.query;
  const [scrape, setScrape] = useState<Scrape | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [resultError, setResultError] = useState<boolean>(false);

  const [format, setFormat] = useState<"JSON" | "CSV">("CSV");

  useEffect(() => {
    if (router.isReady && !userLoading) {
      getData();
    }
  }, [router.isReady, userLoading]);

  useEffect(() => {
    if (scrape?.status === "done") {
      console.log("GETTING RESULTS");
      getResultData();
    }
  }, [scrape?.status]);

//   useInterval(() => {
//     if (scrape == null || !terminal_status.includes(scrape.status)) {
//       getData();
//     }
//   }, 10000);

  const getData = async () => {
    console.log("getting data");
    if (authUser && sid) {
      const fetchedScrape = await getScrape(authUser, sid as string);
      setScrape(fetchedScrape as Scrape);
    }
  };

  const getResultData = async () => {
    setResultError(false);
    try {
      console.log(scrape);
      const req = await fetch(`/api/construct`, {
        method: "POST",
        body: JSON.stringify(scrape),
      });
      if (!req.ok) {
        throw new Error("Issue constructing results.");
      }
      const resp = await req.json();
      setResult(resp["data"]);
    } catch (exc) {
      setResultError(true);
    }
  };

  if (!router.isReady || !scrape || userLoading) {
    return (
      <div className="container mx-auto pt-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        <p>We are getting your data.</p>
        <p>This page will automatically update as soon as we have your data.</p>
      </div>
    );
  }

  const actionBlock = () => {
    return (
      <button
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        onClick={() => {
          router.push("/scrape/create");
        }}
      >
        + New Scrape
      </button>
    );
  };

  const formatButtonGroup = () => (
    <div className="mt-4 inline-flex rounded-md shadow-sm" role="group">
      <button
        type="button"
        className={`px-4 py-2 text-sm font-medium rounded-l-lg border ${
          format === "JSON"
            ? "bg-blue-500 text-white border-blue-600"
            : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
        }`}
        onClick={() => setFormat("JSON")}
      >
        JSON
      </button>
      <button
        type="button"
        className={`px-4 py-2 text-sm font-medium rounded-r-lg border-t border-b border-r ${
          format === "CSV"
            ? "bg-blue-500 text-white border-blue-600"
            : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
        }`}
        onClick={() => setFormat("CSV")}
      >
        CSV
      </button>
    </div>
  );

  const renderResultBlock = () => {
    if (format === "CSV") {
        const jsonRes = JSON.parse(result || "{}");
        const keys = Object.keys(jsonRes);
        const rows = Object.values(jsonRes).reduce((acc: any[], curr: any, i: number) => {
          curr.forEach((item: any, j: number) => {
            if (!acc[j]) {
              acc[j] = {};
            }
            acc[j][keys[i]] = item;
          });
          return acc;
        }, []);
        return (
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-300">
              <thead>
                <tr>
                  <th className="px-4 py-2 bg-gray-100 border-b border-r"></th>
                  {keys.map((key, index) => (
                    <th key={index} className="px-4 py-2 bg-gray-100 border-b border-r">{key}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row: any, index: number) => (
                  <tr key={index}>
                    <td className="px-4 py-2 border-b border-r">{index + 1}</td>
                    {keys.map((key, keyIndex) => (
                      <td key={keyIndex} className="px-4 py-2 border-b border-r">{row[key]}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
    } else if (format === "JSON") {
        const jsonRes = JSON.parse(result || "{}");
        return (
          <div className="mt-4 overflow-x-auto">
            <pre className="bg-gray-100 rounded-md border border-gray-300 p-4 whitespace-pre-wrap break-words">
              {JSON.stringify(jsonRes, null, 2)}
            </pre>
          </div>
        );
      }
    }

  const downloadData = () => {
    if (!result) return;

    let data: string;
    let fileType: string;
    let fileName: string;
    if (format === "JSON") {
      const jsonRes = JSON.parse(result);
      data = JSON.stringify(jsonRes, null, 2);
      fileType = "application/json";
      fileName = "data.json";
    } else if (format === "CSV") {
      const jsonRes = JSON.parse(result);
      const keys = Object.keys(jsonRes);
      const rows = Object.values(jsonRes).reduce((acc: any[], curr: any, i: number) => {
        curr.forEach((item: any, j: number) => {
          if (!acc[j]) {
            acc[j] = {};
          }
          acc[j][keys[i]] = item;
        });
        return acc;
      }, []);
      const parser = new Parser({fields: keys});
      data = parser.parse(rows);
      fileType = "text/csv";
      fileName = "data.csv";
    } else {
      data = result;
      fileType = "text/plain";
      fileName = "data.txt";
    }
    const element = document.createElement("a");
    const file = new Blob([data], { type: fileType });
    element.href = URL.createObjectURL(file);
    element.download = fileName;
    document.body.appendChild(element);
    element.click();
  };

  const resultBlock = () => {
    if (result == null) {
      return <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>;
    }
    return (
      <>
        <div>
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            onClick={downloadData}
          >
            Download
          </button>
        </div>
        <div className="mb-4">
          {formatButtonGroup()}
        </div>
        
        {renderResultBlock()}
      </>
    );
  };

  const fieldBubbles = () => {
    const items = scrape.fields?.split(",") || [];

    return (
      <div className="flex flex-wrap mt-2">
        {items.map((item, index) => (
          <span key={index} className="bg-blue-100 text-blue-800 text-xs font-medium mr-2 px-2.5 py-0.5 rounded-full">
            {item.trim()}
          </span>
        ))}
      </div>
    );
  };

  if (!authUser) {
    return <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>;
  }

  return (
    <>
      <NavBar />
      <div className="container mx-auto pt-4 max-w-3xl">
        <div className="text-left">
          <h2 className="text-2xl font-bold mb-4">
            <a href={scrape.url} target="_blank" rel="noreferrer noopener" className="text-blue-600 hover:text-blue-800">
              {scrape.url}
            </a>
          </h2>
          {/* <h4 className="text-lg text-gray-600">{getScrapeDateString(scrape.created)}</h4> */}
          <div className="flex">
            {fieldBubbles()}
          </div>
          <div className="mt-2 flex">
            {getScrapeStatusBadge(scrape.status)}
          </div>
        </div>
        <div className="mt-4">
          {resultBlock()}
        </div>
      </div>
    </>
  );
}
