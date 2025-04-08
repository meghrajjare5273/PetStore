// src/app/store/search/page.tsx
import { prisma } from "@/lib/prisma";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
// Assume PetList and ProductList components exist
import { PetList } from "@/components/PetList";
import { ProductList } from "@/components/ProductList";

interface SearchProps {
  searchParams: Promise<{
    query: string;
  }>;
}

export default async function SearchPage({ searchParams }: SearchProps) {
  const query = (await searchParams).query || "";

  const [pets, products] = await Promise.all([
    prisma.pet.findMany({
      where: {
        OR: [
          { breed: { contains: query, mode: "insensitive" } },
          { type: { contains: query, mode: "insensitive" } },
          { description: { contains: query, mode: "insensitive" } },
        ],
        purchaseId: null, // Only available pets
      },
    }),
    prisma.product.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: "insensitive" } },
          { category: { contains: query, mode: "insensitive" } },
          { description: { contains: query, mode: "insensitive" } },
        ],
        stockQuantity: { gt: 0 }, // Only in-stock products
      },
    }),
  ]);

  return (
    <div className="container py-8 px-4 md:px-6">
      <h1 className="text-3xl font-bold mb-6">
        Search Results for &quot;{query}&quot;
      </h1>
      <form action="/store/search" method="GET" className="flex gap-2 mb-8">
        <Input
          type="search"
          name="q"
          defaultValue={query}
          placeholder="Search pets and products"
          className="flex-1"
        />
        <Button type="submit">
          <Search className="h-4 w-4 mr-2" />
          Search
        </Button>
      </form>
      {pets.length === 0 && products.length === 0 ? (
        <p className="text-muted-foreground">
          No results found for &quot;{query}&quot;
        </p>
      ) : (
        <div className="space-y-12">
          {pets.length > 0 && (
            <div>
              <h2 className="text-2xl font-semibold mb-4">Pets</h2>
              <PetList pets={pets} />
            </div>
          )}
          {products.length > 0 && (
            <div>
              <h2 className="text-2xl font-semibold mb-4">Products</h2>
              <ProductList products={products} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
