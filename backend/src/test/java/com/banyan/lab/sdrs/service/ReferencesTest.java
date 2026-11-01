package com.banyan.lab.sdrs.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatCode;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.banyan.lab.sdrs.entity.Market;
import com.banyan.lab.sdrs.support.CollectionTestData;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.function.Function;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

/** Slugs → rows: caller's order, repeats dropped, a miss refused. */
class ReferencesTest {

    private static final Market BUILDINGS = CollectionTestData.market("buildings", "Buildings");
    private static final Market RAIL = CollectionTestData.market("rail", "Rail");
    private static final Market WATER = CollectionTestData.market("water", "Water");

    /** A finder over a fixed table that records what it was asked for. */
    private static final class Table implements Function<Collection<String>, List<Market>> {

        private final List<Market> rows;
        private final List<Collection<String>> calls = new ArrayList<>();

        Table(Market... rows) {
            this.rows = List.of(rows);
        }

        @Override
        public List<Market> apply(Collection<String> slugs) {
            calls.add(List.copyOf(slugs));
            return rows.stream().filter(row -> slugs.contains(row.getSlug())).toList();
        }
    }

    private static List<Market> resolve(List<String> slugs, Table table) {
        return References.resolve(slugs, table, Market::getSlug, "market");
    }

    @Test
    @DisplayName("returns rows in the order the slugs were given, not the order found")
    void testIfResolveKeepsTheCallersOrder() {
        Table table = new Table(BUILDINGS, RAIL, WATER);

        assertThat(resolve(List.of("water", "buildings", "rail"), table))
                .containsExactly(WATER, BUILDINGS, RAIL);
    }

    @Test
    @DisplayName("a repeated slug resolves once and is looked up once")
    void testIfResolveDropsRepeatedSlugs() {
        Table table = new Table(BUILDINGS, RAIL);

        assertThat(resolve(List.of("rail", "buildings", "rail"), table)).containsExactly(RAIL, BUILDINGS);
        assertThat(table.calls).singleElement().isEqualTo(List.of("rail", "buildings"));
    }

    @Test
    @DisplayName("an empty list is empty, without calling the finder")
    void testIfResolveWithEmptyListSkipsTheFinder() {
        Table table = new Table(BUILDINGS);

        assertThat(resolve(List.of(), table)).isEmpty();
        assertThat(table.calls).isEmpty();
    }

    @Test
    @DisplayName("a slug naming no row is refused, naming the resource and the slug")
    void testIfResolveRefusesMissingSlug() {
        assertThatThrownBy(() -> resolve(List.of("buildings", "atlantis"), new Table(BUILDINGS)))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("No market with slug atlantis");
    }

    @Test
    @DisplayName("every missing slug is listed, in the order given")
    void testIfResolveListsEveryMissingSlug() {
        assertThatThrownBy(() -> resolve(List.of("lemuria", "buildings", "atlantis"), new Table(BUILDINGS)))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("No market with slug lemuria, atlantis");
    }

    @Test
    @DisplayName("an empty table refuses every slug")
    void testIfResolveRefusesEverySlugWhenTableIsEmpty() {
        assertThatThrownBy(() -> resolve(List.of("buildings"), new Table()))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("buildings");
    }

    @Test
    @DisplayName("slug matching is exact: case differs, row differs")
    void testIfResolveMatchesSlugsCaseSensitively() {
        assertThatThrownBy(() -> resolve(List.of("Buildings"), new Table(BUILDINGS)))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Buildings");
    }

    @Test
    @DisplayName("the same slug in path and body passes")
    void testIfRequireSameSlugAcceptsMatchingSlugs() {
        assertThatCode(() -> References.requireSameSlug("rail", "rail")).doesNotThrowAnyException();
    }

    @Test
    @DisplayName("a different body slug is refused, naming both")
    void testIfRequireSameSlugRefusesDifferentSlug() {
        assertThatThrownBy(() -> References.requireSameSlug("rail", "water"))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Path slug \"rail\" does not match body slug \"water\"");
    }

    @Test
    @DisplayName("a missing body slug is refused, not treated as a match")
    void testIfRequireSameSlugRefusesNullBodySlug() {
        assertThatThrownBy(() -> References.requireSameSlug("rail", null))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("null");
    }

    @Test
    @DisplayName("slug comparison is case-sensitive")
    void testIfRequireSameSlugIsCaseSensitive() {
        assertThatThrownBy(() -> References.requireSameSlug("rail", "Rail"))
                .isInstanceOf(IllegalArgumentException.class);
    }
}
