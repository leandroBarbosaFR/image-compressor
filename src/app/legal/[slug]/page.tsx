import { notFound } from "next/navigation";
import { Mail, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LEGAL_CONTENT } from "./legalContent";

export default async function LegalPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const page = LEGAL_CONTENT.find((p) => p.slug === slug);

  if (!page) return notFound();

  return (
    <section className="relative min-h-dvh mx-auto py-10 px-6 flex items-center justify-center">
      {/* BACKGROUND */}
      <div
        className="absolute inset-0 z-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(226, 232, 240, 0.15), transparent 70%), #000000",
        }}
      />

      {/* CONTENT */}
      <div className="relative z-10 max-w-3xl w-full">
        {/* Back Button */}
        <div className="mb-6">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/" className="text-gray-400 hover:text-white">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Link>
          </Button>
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold mb-8 text-white">{page.title}</h1>

        {/* Legal Content */}
        <div
          className="prose text-gray-300 mx-auto mb-12
            prose-headings:text-white prose-headings:font-semibold
            prose-p:text-gray-300 prose-p:leading-relaxed
            prose-li:text-gray-300
            prose-strong:text-white
            prose-a:text-gray-100 prose-a:underline hover:prose-a:text-white"
          dangerouslySetInnerHTML={{ __html: page.content }}
        />

        {/* Help CTA */}
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
          <div className="flex items-start gap-4">
            <Mail className="w-6 h-6 text-gray-400 mt-1 flex-shrink-0" />
            <div>
              <h3 className="text-lg font-medium text-white mb-2">
                Need help or clarification?
              </h3>
              <p className="text-gray-300 mb-4">
                If you have questions about our terms or policies, our team is
                here to assist you.
              </p>
              <Button asChild>
                <a href="mailto:contact@1367studio.com">
                  <Mail className="w-4 h-4 mr-2" />
                  Contact us
                </a>
              </Button>
            </div>
          </div>
        </div>

        {/* Last Updated */}
        <div className="text-center mt-8">
          <p className="text-sm text-gray-500">
            Last updated: {new Date().toLocaleDateString("en-US")}
          </p>
        </div>
      </div>
    </section>
  );
}
