"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Filter, X } from "lucide-react";
import { useExerciseFilters } from "@/hooks/use-exercises";

export interface ExerciseFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedBodyPart: string | null;
  onBodyPartChange: (bodyPart: string | null) => void;
  selectedEquipment: string | null;
  onEquipmentChange: (equipment: string | null) => void;
  selectedTarget: string | null;
  onTargetChange: (target: string | null) => void;
  showFilters: boolean;
  onToggleFilters: () => void;
  onClearFilters: () => void;
}

export function ExerciseFilters({
  searchQuery,
  onSearchChange,
  selectedBodyPart,
  onBodyPartChange,
  selectedEquipment,
  onEquipmentChange,
  selectedTarget,
  onTargetChange,
  showFilters,
  onToggleFilters,
  onClearFilters,
}: ExerciseFiltersProps) {
  // Fetch filter options from API
  const { data: filterOptions, isLoading: isLoadingFilters } =
    useExerciseFilters();

  const hasActiveFilters =
    searchQuery || selectedBodyPart || selectedEquipment || selectedTarget;

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Search exercises by name..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button
          variant={showFilters ? "default" : "secondary"}
          className="gap-2"
          onClick={onToggleFilters}
        >
          <Filter className="h-4 w-4" />
          Filters
        </Button>
      </div>

      {/* Active Filters */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="p3 text-muted-foreground">Active filters:</span>
          {searchQuery && (
            <Badge variant="secondary" className="gap-1">
              Search: {searchQuery}
              <button
                onClick={() => onSearchChange("")}
                className="ml-1 hover:text-foreground"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {selectedBodyPart && (
            <Badge variant="secondary" className="gap-1">
              Body: {selectedBodyPart}
              <button
                onClick={() => onBodyPartChange(null)}
                className="ml-1 hover:text-foreground"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {selectedEquipment && (
            <Badge variant="secondary" className="gap-1">
              Equipment: {selectedEquipment}
              <button
                onClick={() => onEquipmentChange(null)}
                className="ml-1 hover:text-foreground"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {selectedTarget && (
            <Badge variant="secondary" className="gap-1">
              Target: {selectedTarget}
              <button
                onClick={() => onTargetChange(null)}
                className="ml-1 hover:text-foreground"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            className="h-6 px-2 text-xs"
          >
            Clear all
          </Button>
        </div>
      )}

      {/* Filters Panel */}
      {showFilters && (
        <Card>
          <CardContent className="pt-6">
            {isLoadingFilters ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-3">
                {/* Body Part Filter */}
                <div className="space-y-3">
                  <h3 className="t4 font-semibold">Body Part</h3>
                  <div className="flex flex-wrap gap-2">
                    {filterOptions?.bodyParts.map((part) => (
                      <Badge
                        key={part}
                        variant={
                          selectedBodyPart === part ? "default" : "outline"
                        }
                        className="cursor-pointer capitalize hover:bg-primary hover:text-primary-foreground transition-colors"
                        onClick={() =>
                          onBodyPartChange(
                            selectedBodyPart === part ? null : part
                          )
                        }
                      >
                        {part}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Equipment Filter */}
                <div className="space-y-3">
                  <h3 className="t4 font-semibold">Equipment</h3>
                  <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto">
                    {filterOptions?.equipments.map((equip) => (
                      <Badge
                        key={equip}
                        variant={
                          selectedEquipment === equip ? "default" : "outline"
                        }
                        className="cursor-pointer capitalize hover:bg-primary hover:text-primary-foreground transition-colors"
                        onClick={() =>
                          onEquipmentChange(
                            selectedEquipment === equip ? null : equip
                          )
                        }
                      >
                        {equip}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Target Muscle Filter */}
                <div className="space-y-3">
                  <h3 className="t4 font-semibold">Target Muscle</h3>
                  <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto">
                    {filterOptions?.targets.map((target) => (
                      <Badge
                        key={target}
                        variant={
                          selectedTarget === target ? "default" : "outline"
                        }
                        className="cursor-pointer capitalize hover:bg-primary hover:text-primary-foreground transition-colors"
                        onClick={() =>
                          onTargetChange(
                            selectedTarget === target ? null : target
                          )
                        }
                      >
                        {target}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
