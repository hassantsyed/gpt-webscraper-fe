import NavBar from "@/components/Navbar";
import { useAuth } from "@/components/context/authContext";
import { createScrapes, upsertUser } from "@/utils/db/handlers";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { isWebUri } from "valid-url";
import { BaseUser } from "@/utils/interfaces";

export default function MultiScrap() {
  const { authUser, userLoading, signIn, logout } = useAuth();
  const [allLinks, setAllLinks] = useState<string>("");
  const [url, setUrl] = useState<string>("");
  const [foundLinks, setFoundLinks] = useState<string[]>([]);
  const [fields, setFields] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);

  const [loginError, setLoginError] = useState<boolean>(false);
  const [showSubscribeCard, setShowSubscribeCard] = useState<boolean>(false);
  const router = useRouter();

  useEffect(() => {
    parseLinks();
  }, [allLinks]);

  const submitScrapes = async (user: BaseUser) => {
    // const scrapes = foundLinks.map((link) => {
    //   return {
    //     url: link,
    //     fields: fields,
    //   };
    // });
    const singleScrape = [
        {
            url: url,
            fields: fields
        }
    ]
    await createScrapes(user, singleScrape);
  };

  const handleScrape = async () => {
    setSubmitting(true);
    let user: BaseUser | null = null;
    if (authUser) {
      user = authUser;
    } else {
      user = await signIn();
    }
    if (!user) {
      setSubmitting(false);
      setLoginError(true);
      return;
    }
    await submitScrapes(user);
    router.push("/scrape/list");
    setSubmitting(false);
  };

  const parseLinks = () => {
    const found = allLinks.split(",").map((l) => l.trim());
    const cleaned = found.filter((link) => link.trim().length > 0);
    setFoundLinks(cleaned);
  };

  const isUrl = (url: string): boolean => {
    return isWebUri(url) != null;
  };

  const foundLinksList = () => {
    return (
      <ul className="divide-y divide-gray-200">
        {foundLinks.map((link, idx) => (
          <li
            key={idx}
            className={`py-2 ${
              isUrl(link) ? "text-blue-600" : "text-red-600"
            }`}
          >
            {link}
          </li>
        ))}
      </ul>
    );
  };

  const fieldBubbles = () => {
    let items: string[] = [];
    if (fields && fields !== "" && fields.length > 0) {
      items = fields.split(",");
    }

    return (
      <div className="flex flex-wrap">
        {items.filter(item => item.trim() !== '').map((item, index) => (
          <span
            key={index}
            className="bg-blue-100 text-blue-800 text-xs font-medium mr-2 px-2.5 py-0.5 rounded-full"
          >
            {item.trim()}
          </span>
        ))}
      </div>
    );
  };

  const foundLinksRender = foundLinksList();
  const canScrape = foundLinks.length > 0 && fields != null;
  const invalidCount = foundLinks.filter((link) => !isUrl(link)).length;
  const trigger = (
    <button
      className={`mt-4 text-xl py-2 px-4 rounded ${
        canScrape
          ? "bg-blue-500 hover:bg-blue-700 text-white cursor-pointer"
          : "bg-gray-300 text-gray-500 cursor-not-allowed"
      }`}
      disabled={!canScrape}
      onClick={handleScrape}
    >
      {submitting ? (
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
      ) : (
        "Scrape!"
      )}
    </button>
  );

  return (
    <>
      <NavBar />
      <div className="container mx-auto pt-16 px-4 max-w-xl">
        <h1 className="text-4xl font-bold mb-4 text-left text-gray-800">Create New Scrape Job</h1>
        <div className="mb-4">
          <label className="block text-gray-700 text-lg font-medium mb-2">
            Enter URL to scrape
          </label>
          <input
            className="appearance-none border-2 border-gray-100 rounded-lg w-full py-3 px-3 text-gray-700 leading-tight focus:outline-none focus:border-blue-500 focus:bg-white bg-gray-100"
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com"
          />
        </div>
        {url && (
          <div className="mb-4">
            <p className={`text-sm ${isUrl(url) ? 'text-blue-600' : 'text-red-600'}`}>
              {url}
            </p>
          </div>
        )}
        <div className="mb-2">
          <label className="block text-gray-700 text-lg font-medium mb-2">
            Enter columns to extract (comma-separated)
          </label>
          <input
            className="appearance-none border-2 border-gray-100 rounded-lg w-full py-3 px-3 text-gray-700 leading-tight focus:outline-none focus:border-blue-500 focus:bg-white bg-gray-100"
            type="text"
            value={fields ?? ''}
            onChange={(e) => setFields(e.target.value)}
            placeholder="title, price, description"
          />
        </div>
        {fieldBubbles()}
        <div className="flex mt-8">
          <button
            className="bg-white hover:bg-gray-100 text-blue-500 font-medium py-3 px-6 rounded-lg text-lg border border-blue-500"
            onClick={handleScrape}
            disabled={submitting}
          >
            {submitting ? "Processing..." : "Start Scraping"}
          </button>
        </div>
      </div>
    </>
  );
}
