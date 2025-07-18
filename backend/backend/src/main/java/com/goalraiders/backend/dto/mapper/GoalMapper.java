package com.goalraiders.backend.dto.mapper;

import com.goalraiders.backend.Goal;
import com.goalraiders.backend.dto.GoalDto;
import org.mapstruct.BeanMapping;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.factory.Mappers;

import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

@Mapper(componentModel = "spring")
public interface GoalMapper {
    GoalMapper INSTANCE = Mappers.getMapper(GoalMapper.class);

    @Mapping(source = "user.firebaseUid", target = "userId")
    @Mapping(source = "parentGoal.id", target = "parentGoalId")
    GoalDto toDto(Goal goal);

    @Mapping(target = "id", ignore = true) // DTO to Entity 매핑 시 id는 무시
    @Mapping(target = "user", ignore = true) // User는 서비스 레이어에서 설정
    @Mapping(target = "parentGoal", ignore = true) // ParentGoal은 서비스 레이어에서 설정
    @Mapping(target = "subGoals", ignore = true)
    @Mapping(target = "defeated", ignore = true)
    Goal toEntity(GoalDto goalDto);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    void updateGoalFromDto(GoalDto goalDto, @MappingTarget Goal goal);
}
