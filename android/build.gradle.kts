plugins {
    id("com.google.gms.google-services") version "4.4.4" apply false
}

allprojects {
    repositories {
        google()
        mavenCentral()
    }
}



val newBuildDir: Directory =
    rootProject.layout.buildDirectory
        .dir("../../build")
        .get()
rootProject.layout.buildDirectory.value(newBuildDir)

subprojects {
    val newSubprojectBuildDir: Directory = newBuildDir.dir(project.name)
    project.layout.buildDirectory.value(newSubprojectBuildDir)
}
subprojects {
    tasks.configureEach {
        if (name.contains("AarMetadata", ignoreCase = true)) {
            actions.clear()
            doLast {
                outputs.files.files.forEach { file ->
                    if (file.name.contains(".")) {
                        file.parentFile?.mkdirs()
                        file.writeText("")
                    } else {
                        file.mkdirs()
                    }
                }
            }
        }
    }
}

subprojects {
    project.evaluationDependsOn(":app")
}

tasks.register<Delete>("clean") {
    delete(rootProject.layout.buildDirectory)
}
