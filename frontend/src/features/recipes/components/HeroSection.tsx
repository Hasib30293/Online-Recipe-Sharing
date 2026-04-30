import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { ChevronLeft, ChevronRight, Clock, Star, ChefHat, Share2, PlusCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useRecipes } from "@/hooks/useRecipes";
import { resolveRecipeImage } from "@/lib/recipe-images";
import { Skeleton } from "@/components/ui/skeleton";

const HeroSection = () => {
  const navigate = useNavigate();
  const [activeIndex, setActiveIndex] = useState(0);
  const sectionRef = useRef<HTMLElement>(null);
  const { data: allRecipes = [] } = useRecipes();

  const heroRecipes = useMemo(() => allRecipes.slice(0, 7), [allRecipes]);
  const activeRecipe = heroRecipes[activeIndex] ?? null;

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  const blobY = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const contentY = useTransform(scrollYProgress, [0, 1], [0, -40]);
  const orbitY = useTransform(scrollYProgress, [0, 1], [0, 60]);

  const next = useCallback(() => {
    if (heroRecipes.length === 0) return;
    setActiveIndex((prev) => (prev + 1) % heroRecipes.length);
  }, [heroRecipes.length]);

  const prev = useCallback(() => {
    if (heroRecipes.length === 0) return;
    setActiveIndex((prev) => (prev - 1 + heroRecipes.length) % heroRecipes.length);
  }, [heroRecipes.length]);

  useEffect(() => {
    if (heroRecipes.length === 0) return;
    if (activeIndex >= heroRecipes.length) setActiveIndex(0);
  }, [heroRecipes.length, activeIndex]);

  useEffect(() => {
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [next, activeIndex]);

  const orbitPositions = useMemo(() => {
    const count = heroRecipes.length || 1;
    const arcStart = -Math.PI * 0.85;
    const arcEnd = -Math.PI * 0.15;
    return heroRecipes.map((_, i) => {
      const angle = arcStart + (arcEnd - arcStart) * (i / (count - 1));
      const rx = 300, ry = 170, cx = 50, cy = 55;
      return { x: cx + rx * Math.cos(angle), y: cy + ry * Math.sin(angle), angle };
    });
  }, [heroRecipes.length]);

  const arcPath = useMemo(() => {
    const rx = 300, ry = 170, cx = 50, cy = 55;
    const startAngle = -Math.PI * 0.85;
    const endAngle = -Math.PI * 0.15;
    const steps = 60;
    const points: string[] = [];
    for (let i = 0; i <= steps; i++) {
      const angle = startAngle + (endAngle - startAngle) * (i / steps);
      points.push(`${i === 0 ? "M" : "L"} ${cx + rx * Math.cos(angle)} ${cy + ry * Math.sin(angle)}`);
    }
    return points.join(" ");
  }, []);

  if (heroRecipes.length === 0 || !activeRecipe) {
    return (
      <section className="relative pt-24 pb-8 lg:pt-28 lg:pb-16">
        <div className="container mx-auto px-4 lg:px-8">
          <Skeleton className="h-[400px] w-full rounded-card" />
        </div>
      </section>
    );
  }

  return (
    <section ref={sectionRef} className="relative pt-24 pb-8 lg:pt-28 lg:pb-16 overflow-hidden">
      <motion.div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ y: blobY }}>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/3 w-[700px] h-[700px] lg:w-[1000px] lg:h-[900px] rounded-full bg-secondary/60 blur-3xl" />
        <div className="absolute top-1/4 right-1/4 w-[300px] h-[300px] rounded-full bg-primary/5 blur-2xl" />
      </motion.div>

      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-4 items-center min-h-[520px]">
          <motion.div className="lg:col-span-5 space-y-6 z-10" style={{ y: contentY }}>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm font-medium text-primary uppercase tracking-wider">
              Dish of the Day
            </motion.p>

            <AnimatePresence mode="wait">
              <motion.div
                key={activeRecipe.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.4 }}
                className="space-y-3"
              >
                <h1 className="text-3xl lg:text-5xl font-display font-bold text-foreground leading-tight">
                  {activeRecipe.title}
                </h1>
                <p className="text-muted-foreground text-base lg:text-lg max-w-sm">
                  {activeRecipe.description}
                </p>
              </motion.div>
            </AnimatePresence>

            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate(`/recipes/${activeRecipe.id}`)}
                className="h-12 px-8 bg-primary text-primary-foreground font-semibold rounded-full hover:opacity-90 transition-opacity text-sm"
              >
                Explore Recipe
              </button>
              <button
                onClick={() => navigate("/post-recipe")}
                className="h-12 px-6 border border-border bg-background text-foreground font-semibold rounded-full hover:border-primary transition-colors text-sm flex items-center gap-2"
              >
                <PlusCircle className="w-4 h-4" /> Post a recipe
              </button>
            </div>
          </motion.div>

          <motion.div className="lg:col-span-7 relative flex flex-col items-center" style={{ y: orbitY }}>
            <div className="relative w-full" style={{ paddingBottom: "85%" }}>
              <svg viewBox="-300 -170 700 400" className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="xMidYMid meet">
                <path d={arcPath} fill="none" stroke="hsl(var(--border))" strokeWidth="1.5" strokeDasharray="6 6" opacity="0.7" />
                {orbitPositions.map((pos, i) => (
                  <circle key={`dot-${i}`} cx={pos.x} cy={pos.y} r={i === activeIndex ? 0 : 3} fill="hsl(var(--primary))" opacity={i === activeIndex ? 0 : 0.3} />
                ))}
              </svg>

              {heroRecipes.map((recipe, i) => {
                if (i === activeIndex) return null;
                const pos = orbitPositions[i];
                const leftPct = (pos.x + 300) / 700 * 100;
                const topPct = (pos.y + 170) / 400 * 100;
                return (
                  <motion.button
                    key={recipe.id}
                    onClick={() => setActiveIndex(i)}
                    className="absolute rounded-full overflow-hidden img-outline shadow-card cursor-pointer z-10"
                    style={{ left: `${leftPct}%`, top: `${topPct}%` }}
                    initial={false}
                    animate={{ width: 68, height: 68, x: "-50%", y: "-50%", opacity: 1 }}
                    whileHover={{ scale: 1.3, zIndex: 20 }}
                    transition={{ type: "spring", stiffness: 200, damping: 20 }}
                  >
                    <img src={resolveRecipeImage(recipe.imageUrl)} alt={recipe.title} className="w-full h-full object-cover" />
                  </motion.button>
                );
              })}

              <AnimatePresence mode="wait">
                <motion.div
                  key={activeRecipe.id}
                  className="absolute z-20"
                  style={{ left: "50%", top: "62%" }}
                  initial={{ scale: 0.3, opacity: 0, x: "-50%", y: "-120%" }}
                  animate={{ scale: 1, opacity: 1, x: "-50%", y: "-50%" }}
                  exit={{ scale: 0.4, opacity: 0, x: "-50%", y: "-50%" }}
                  transition={{ type: "spring", stiffness: 120, damping: 18, mass: 0.8 }}
                >
                  <div className="w-[280px] h-[280px] lg:w-[300px] lg:h-[300px] rounded-full overflow-hidden img-outline shadow-card-hover">
                    <img src={resolveRecipeImage(activeRecipe.imageUrl)} alt={activeRecipe.title} className="w-full h-full object-cover" />
                  </div>

                  <motion.div initial={{ opacity: 0, scale: 0.5, x: 20 }} animate={{ opacity: 1, scale: 1, x: 0 }} exit={{ opacity: 0, scale: 0.5 }} transition={{ delay: 0.3, type: "spring", stiffness: 200, damping: 15 }} className="absolute -top-2 -left-8 bg-card border border-border rounded-xl px-3 py-2 shadow-card flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center"><Clock className="w-3.5 h-3.5 text-primary" /></div>
                    <div><p className="text-[10px] text-muted-foreground">Prep Time</p><p className="text-xs font-semibold text-foreground">{activeRecipe.prepTime}</p></div>
                  </motion.div>

                  <motion.div initial={{ opacity: 0, scale: 0.5, x: -20 }} animate={{ opacity: 1, scale: 1, x: 0 }} exit={{ opacity: 0, scale: 0.5 }} transition={{ delay: 0.4, type: "spring", stiffness: 200, damping: 15 }} className="absolute -top-2 -right-6 bg-card border border-border rounded-xl px-3 py-2 shadow-card flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-accent/10 flex items-center justify-center"><Star className="w-3.5 h-3.5 text-accent" /></div>
                    <div><p className="text-[10px] text-muted-foreground">Rating</p><p className="text-xs font-semibold text-foreground">{Number(activeRecipe.rating).toFixed(1)}</p></div>
                  </motion.div>

                  <motion.div initial={{ opacity: 0, scale: 0.5, y: -20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.5 }} transition={{ delay: 0.5, type: "spring", stiffness: 200, damping: 15 }} className="absolute bottom-4 -right-10 bg-card border border-border rounded-xl px-3 py-2 shadow-card flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center"><ChefHat className="w-3.5 h-3.5 text-primary" /></div>
                    <div><p className="text-[10px] text-muted-foreground">Difficulty</p><p className="text-xs font-semibold text-foreground">{activeRecipe.difficulty}</p></div>
                  </motion.div>
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="flex items-center -mt-8 z-30 py-0 gap-[113px]">
              <motion.button onClick={prev} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }} className="w-10 h-10 rounded-full border border-border bg-background flex items-center justify-center text-foreground hover:border-primary transition-colors">
                <ChevronLeft className="w-5 h-5" />
              </motion.button>
              <span className="text-xs text-muted-foreground tabular-nums">
                {activeIndex + 1} / {heroRecipes.length}
              </span>
              <motion.button onClick={next} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }} className="w-10 h-10 rounded-full border border-border bg-background flex items-center justify-center text-foreground hover:border-primary transition-colors">
                <ChevronRight className="w-5 h-5" />
              </motion.button>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
