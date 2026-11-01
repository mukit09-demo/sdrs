package com.banyan.lab.sdrs.entity;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.util.Arrays;
import java.util.function.Function;
import java.util.stream.Stream;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.MethodSource;
import org.junit.jupiter.params.provider.NullAndEmptySource;
import org.junit.jupiter.params.provider.ValueSource;

/**
 * The label is what goes on the wire and the constant is what goes in the
 * column; {@code fromLabel} has to accept both, forgivingly, and refuse anything
 * else with a message naming the valid labels.
 */
class LabelledTest {

    /** Every {@link Labelled} enum, with its {@code @JsonCreator}. */
    static Stream<Arguments> everyConstant() {
        return Stream.of(
                        constants(NewsType.class, NewsType::fromLabel),
                        constants(ServiceCategory.class, ServiceCategory::fromLabel),
                        constants(JobStatus.class, JobStatus::fromLabel),
                        constants(EmploymentType.class, EmploymentType::fromLabel),
                        constants(CareerLevel.class, CareerLevel::fromLabel))
                .flatMap(Function.identity());
    }

    private static <E extends Enum<E> & Labelled> Stream<Arguments> constants(
            Class<E> type, Function<String, E> fromLabel) {
        return Arrays.stream(type.getEnumConstants()).map(value -> Arguments.of(value, fromLabel));
    }

    @ParameterizedTest(name = "{0}")
    @MethodSource("everyConstant")
    @DisplayName("every constant round-trips through its label")
    void testIfEveryConstantRoundTripsThroughItsLabel(Labelled value, Function<String, Labelled> fromLabel) {
        assertThat(fromLabel.apply(value.getLabel())).isSameAs(value);
    }

    @ParameterizedTest(name = "{0}")
    @MethodSource("everyConstant")
    @DisplayName("every constant is also found by its name, so a stored value still parses")
    void testIfEveryConstantIsFoundByItsName(Labelled value, Function<String, Labelled> fromLabel) {
        assertThat(fromLabel.apply(((Enum<?>) value).name())).isSameAs(value);
    }

    @ParameterizedTest(name = "{0}")
    @MethodSource("everyConstant")
    @DisplayName("case and surrounding whitespace are forgiven")
    void testIfLabelLookupIgnoresCaseAndWhitespace(Labelled value, Function<String, Labelled> fromLabel) {
        assertThat(fromLabel.apply("  " + value.getLabel().toUpperCase() + "\t")).isSameAs(value);
        assertThat(fromLabel.apply(((Enum<?>) value).name().toLowerCase())).isSameAs(value);
    }

    @Test
    @DisplayName("labels are the front end's strings, not the constants")
    void testIfLabelsMatchTheFrontEndStrings() {
        assertThat(NewsType.PRESS_RELEASE.getLabel()).isEqualTo("Press release");
        assertThat(ServiceCategory.DESIGN_AND_ENGINEERING.getLabel()).isEqualTo("Design & Engineering");
        assertThat(EmploymentType.FULL_TIME.getLabel()).isEqualTo("Full time");
        assertThat(JobStatus.OPEN.getLabel()).isEqualTo("Open");
        assertThat(CareerLevel.LEADERSHIP.getLabel()).isEqualTo("Leadership");
    }

    @ParameterizedTest
    @ValueSource(strings = {"Press-release", "PressRelease", "Press  release", "Blog", "PRESS_RELEASES"})
    @DisplayName("a near miss is refused, not guessed at")
    void testIfNearMissLabelIsRefused(String raw) {
        assertThatThrownBy(() -> NewsType.fromLabel(raw))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Unknown NewsType")
                .hasMessageContaining(raw);
    }

    @ParameterizedTest
    @NullAndEmptySource
    @ValueSource(strings = {"   "})
    @DisplayName("null, empty and blank are refused rather than defaulting")
    void testIfNullEmptyOrBlankLabelIsRefused(String raw) {
        assertThatThrownBy(() -> JobStatus.fromLabel(raw)).isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    @DisplayName("the refusal lists every valid label, in declaration order")
    void testIfRefusalListsEveryValidLabel() {
        assertThatThrownBy(() -> NewsType.fromLabel("Blog"))
                .hasMessage("Unknown NewsType \"Blog\". Expected one of: "
                        + "Press release, Insight, Award, Report, Event");
    }

    @Test
    @DisplayName("labels() joins every label in declaration order")
    void testIfLabelsJoinsInDeclarationOrder() {
        assertThat(Labelled.labels(JobStatus.class)).isEqualTo("Draft, Open, Closed");
        assertThat(Labelled.labels(EmploymentType.class)).isEqualTo("Full time, Part time, Contract");
    }
}
