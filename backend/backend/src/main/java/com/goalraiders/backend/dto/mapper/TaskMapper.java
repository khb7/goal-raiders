package com.goalraiders.backend.dto.mapper;

import com.goalraiders.backend.Task;
import com.goalraiders.backend.dto.TaskDto;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.factory.Mappers;

@Mapper(componentModel = "spring")
public interface TaskMapper {
    TaskMapper INSTANCE = Mappers.getMapper(TaskMapper.class);

    @Mapping(source = "user.firebaseUid", target = "userId")
    @Mapping(source = "goal.id", target = "goalId")
    @Mapping(source = "parentTask.id", target = "parentTaskId")
    TaskDto toDto(Task task);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "user", ignore = true)
    @Mapping(target = "goal", ignore = true)
    @Mapping(target = "parentTask", ignore = true)
    Task toEntity(TaskDto taskDto);
}
