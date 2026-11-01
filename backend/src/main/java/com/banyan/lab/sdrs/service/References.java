package com.banyan.lab.sdrs.service;

import java.util.Collection;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

/**
 * Slugs on the wire → rows in the database, for the many-to-many references
 * ({@code relatedMarketSlugs}, {@code marketSlugs}, {@code serviceSlugs}).
 *
 * <p>Keeps the caller's order and drops repeats. A slug that names no row is a
 * 400 rather than being stored or silently skipped: the editor picked it from a
 * list, so a miss means it was deleted under them.
 */
final class References {

    static <T> List<T> resolve(
            List<String> slugs,
            Function<Collection<String>, List<T>> finder,
            Function<T, String> slugOf,
            String resource) {

        LinkedHashSet<String> wanted = new LinkedHashSet<>(slugs);
        if (wanted.isEmpty()) {
            return List.of();
        }

        Map<String, T> found = finder.apply(wanted).stream()
                .collect(Collectors.toMap(slugOf, Function.identity()));

        List<String> missing = wanted.stream().filter(slug -> !found.containsKey(slug)).toList();
        if (!missing.isEmpty()) {
            throw new IllegalArgumentException(
                    "No %s with slug %s".formatted(resource, String.join(", ", missing)));
        }

        return wanted.stream().map(found::get).toList();
    }

    /** The body's slug must match the path — see {@code NewsService.update}. */
    static void requireSameSlug(String path, String body) {
        if (!path.equals(body)) {
            throw new IllegalArgumentException(
                    "Path slug \"%s\" does not match body slug \"%s\"".formatted(path, body));
        }
    }

    private References() {}
}
