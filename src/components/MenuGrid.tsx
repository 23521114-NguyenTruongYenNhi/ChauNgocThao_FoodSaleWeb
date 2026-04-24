/* File: src/components/MenuGrid.tsx */
import { useState, useEffect } from "react";
import { ShoppingCart } from "lucide-react"; // Thay Plus bằng ShoppingCart cho xịn
import { motion, AnimatePresence } from "framer-motion";
import { CATEGORIES, MENU, type Category } from "@/lib/menu";
import { cart } from "@/lib/cart";
import { toast } from "sonner";

export function MenuGrid({ showFilter = true, initialCategory = "all" }: { showFilter?: boolean, initialCategory?: Category | "all" }) {
    const [active, setActive] = useState<Category | "all">(initialCategory);

    useEffect(() => {
        setActive(initialCategory);
    }, [initialCategory]);

    const items = active === "all" ? MENU : MENU.filter((m) => m.category === active);

    return (
        <div>
            {showFilter && (
                <div className="mb-4 flex flex-wrap gap-2 pb-1">
                    <FilterChip active={active === "all"} onClick={() => setActive("all")}>
                        ✨ All
                    </FilterChip>
                    {CATEGORIES.map((c) => (
                        <FilterChip key={c.id} active={active === c.id} onClick={() => setActive(c.id)}>
                            {c.emoji} {c.label}
                        </FilterChip>
                    ))}
                </div>
            )}

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                <AnimatePresence mode="popLayout">
                    {items.map((m) => (
                        <motion.article
                            key={m.id}
                            layout
                            initial={{ opacity: 0, scale: 0.9, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.15 } }}
                            transition={{ type: "spring", stiffness: 400, damping: 30 }}
                            /* 1. Thêm flex flex-col h-full để thẻ luôn cao bằng nhau */
                            className="group flex flex-col h-full overflow-hidden rounded-2xl border border-border/70 bg-card shadow-card transition hover:-translate-y-1 hover:shadow-glow"
                        >
                            <div className="relative aspect-[4/3] overflow-hidden">
                                <img
                                    src={m.image}
                                    alt={m.name}
                                    loading="lazy"
                                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                                />
                                <span className="absolute right-3 top-3 rounded-full bg-foreground/90 px-3 py-1 text-xs font-bold text-background backdrop-blur">
                                    {m.price}k
                                </span>
                            </div>

                            {/* 2. Thêm flex-1 flex flex-col để phần nội dung chiếm hết chỗ trống */}
                            <div className="flex flex-1 flex-col p-4">
                                <div className="flex-1 mb-4">
                                    <h3 className="text-base font-bold leading-tight line-clamp-1">{m.name}</h3>
                                    <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{m.description}</p>
                                </div>

                                {/* 3. Nút bấm bây giờ sẽ luôn bị đẩy xuống đáy nhờ flex-1 ở trên */}
                                <button
                                    onClick={() => {
                                        cart.add(m);
                                        toast.success(`${m.name} added`, { duration: 1500 });
                                    }}
                                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground shadow-card transition hover:brightness-95 active:scale-[0.98]"
                                >
                                    <ShoppingCart className="h-4 w-4" /> Add to Cart
                                </button>
                            </div>
                        </motion.article>
                    ))}
                </AnimatePresence>
            </div>
        </div>
    );
}

function FilterChip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
    return (
        <button
            onClick={onClick}
            className={`shrink-0 rounded-full border px-4 py-2 text-sm font-semibold transition-all duration-300 ${active
                ? "border-primary bg-primary text-primary-foreground shadow-glow scale-105"
                : "border-border bg-background text-foreground hover:bg-accent"
                }`}
        >
            {children}
        </button>
    );
}