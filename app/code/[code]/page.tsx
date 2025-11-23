import React from "react";
import Link from 'next/link'

type StatsLink = {
  id: number;
  code: string;
  url: string;
  clicks: number;
  lastClicked: string | null;
  createdAt: string;
};

async function getLink(code: string) {
  const base =
    process.env.NEXT_PUBLIC_BASE_URL ||
    `http://localhost:${process.env.PORT || 3000}`;

  const res = await fetch(`${base}/api/links/${code}`, {
    cache: "no-store",
    // 👇 THIS LINE IS THE IMPORTANT FIX
    next: { revalidate: 0 },
  });

  if (!res.ok) return null;
  return res.json();
}

export default async function CodeStatsPage({
  params,
}: {
  params: { code: string };
}) {
  const { code } = params;
  const data = await getLink(code);


  if (!data) {
    return <div>Not found</div>;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">
        Stats for <span className="font-mono">{data.code}</span>
      </h2>

      <div className="bg-white rounded-lg shadow p-4 space-y-2 text-sm">
        <p>
          <span className="font-semibold">Target URL: </span>
          <a href={data.url} className="text-blue-600 break-all">
            {data.url}
          </a>
        </p>
        <p>
          <span className="font-semibold">Short URL: </span>
          <code className="bg-gray-100 px-1 py-0.5 rounded">
            {process.env.NEXT_PUBLIC_BASE_URL ?? ""}/{data.code}
          </code>
        </p>
        <p>
          <span className="font-semibold">Total clicks: </span>
          {data.clicks}
        </p>
        <p>
          <span className="font-semibold">Last clicked: </span>
          {data.lastClicked ?? "-"}
        </p>
        <p>
          <span className="font-semibold">Created at: </span>
          {data.createdAt}
        </p>
      </div>

      <Link
        href="/"
        className="inline-block text-sm text-blue-600 hover:underline"
      >
        ← Back to dashboard
      </Link>
    </div>
  );
}
