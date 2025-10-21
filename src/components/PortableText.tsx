import { PortableText as PortableTextReact } from '@portabletext/react';
import { urlFor } from '@/lib/sanity.client';

const components = {
  types: {
    image: ({ value }: any) => {
      if (!value?.asset?._ref) {
        return null;
      }
      return (
        <div className="my-8">
          <img
            src={urlFor(value).width(800).url()}
            alt={value.alt || ' '}
            className="rounded-lg w-full"
          />
          {value.alt && (
            <p className="text-sm text-gray-400 mt-2 text-center">{value.alt}</p>
          )}
        </div>
      );
    },
    code: ({ value }: any) => {
      return (
        <div className="my-6">
          {value.filename && (
            <div className="bg-gray-800 text-gray-400 text-sm px-4 py-2 rounded-t-lg border-b border-gray-700">
              {value.filename}
            </div>
          )}
          <pre className={`${value.filename ? 'rounded-b-lg' : 'rounded-lg'} bg-gray-900 p-4 overflow-x-auto`}>
            <code className={`language-${value.language || 'text'} text-sm`}>
              {value.code}
            </code>
          </pre>
        </div>
      );
    },
  },
  block: {
    h1: ({ children }: any) => (
      <h1 className="text-4xl font-bold text-white mt-12 mb-6">{children}</h1>
    ),
    h2: ({ children }: any) => (
      <h2 className="text-3xl font-bold text-white mt-10 mb-5">{children}</h2>
    ),
    h3: ({ children }: any) => (
      <h3 className="text-2xl font-semibold text-white mt-8 mb-4">{children}</h3>
    ),
    h4: ({ children }: any) => (
      <h4 className="text-xl font-semibold text-white mt-6 mb-3">{children}</h4>
    ),
    normal: ({ children }: any) => (
      <p className="text-gray-300 leading-relaxed mb-4">{children}</p>
    ),
    blockquote: ({ children }: any) => (
      <blockquote className="border-l-4 border-blue-500 pl-4 py-2 my-6 italic text-gray-300">
        {children}
      </blockquote>
    ),
  },
  list: {
    bullet: ({ children }: any) => (
      <ul className="list-disc list-inside space-y-2 mb-4 text-gray-300">
        {children}
      </ul>
    ),
    number: ({ children }: any) => (
      <ol className="list-decimal list-inside space-y-2 mb-4 text-gray-300">
        {children}
      </ol>
    ),
  },
  marks: {
    strong: ({ children }: any) => (
      <strong className="font-bold text-white">{children}</strong>
    ),
    em: ({ children }: any) => <em className="italic">{children}</em>,
    code: ({ children }: any) => (
      <code className="bg-gray-800 text-blue-400 px-1.5 py-0.5 rounded text-sm font-mono">
        {children}
      </code>
    ),
    link: ({ children, value }: any) => {
      const target = (value?.href || '').startsWith('http') ? '_blank' : undefined;
      return (
        <a
          href={value?.href}
          target={target}
          rel={target === '_blank' ? 'noopener noreferrer' : undefined}
          className="text-blue-400 hover:text-blue-300 underline"
        >
          {children}
        </a>
      );
    },
  },
};

export default function PortableText({ value }: { value: any }) {
  return <PortableTextReact value={value} components={components} />;
}
