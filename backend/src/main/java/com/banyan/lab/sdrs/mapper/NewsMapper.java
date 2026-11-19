package com.banyan.lab.sdrs.mapper;

import com.banyan.lab.sdrs.entity.NewsArticle;
import com.banyan.lab.sdrs.dto.ArticleRequest;
import com.banyan.lab.sdrs.dto.ArticleResponse;
import com.banyan.lab.sdrs.dto.ArticleSummaryResponse;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;
import org.mapstruct.ReportingPolicy;

@Mapper(componentModel = "spring", unmappedSourcePolicy = ReportingPolicy.IGNORE)
public interface NewsMapper {

    @Mapping(target = "category", source = "newsType")
    ArticleResponse toResponse(NewsArticle entity);

    @Mapping(target = "category", source = "newsType")
    ArticleSummaryResponse toSummary(NewsArticle entity);

    List<ArticleSummaryResponse> toSummaries(List<NewsArticle> entities);

    @Mapping(target = "newsType", source = "category")
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "tags", qualifiedByName = "normaliseTags")
    NewsArticle toEntity(ArticleRequest request);

    @Named("normaliseTags")
    default List<String> normaliseTags(List<String> tags) {
        if (tags == null) {
            return null;
        }

        LinkedHashSet<String> normalised = new LinkedHashSet<>();
        for (String tag : tags) {
            String value = tag.strip().toLowerCase(Locale.ROOT).replaceAll("(?U)\\s+", "-");
            if (!value.isEmpty()) {
                normalised.add(value);
            }
        }
        return new ArrayList<>(normalised);
    }
}
