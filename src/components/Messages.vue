<template lang="pug">
    div.messages.u-full-width
        transition-group(name="list" tag="div")
            template(v-for="message in visibleMessages").message-wrapper
                Message(
                    :message="message"
                    :key="message.id"
                ).message
</template>

<script>
    import { mapState } from 'vuex';
    import Logger from '@/lib/logger';
    import Message from '@/components/Message';

    export default {
        name: 'Messages',
        components: {
            Message,
        },
        data() {
            return {
                logger: Logger.get(`${this.$options.name} component`),
            };
        },
        computed: {
            ...mapState(['messages', 'isVisible']),
            visibleMessages() {
                if (!this.isVisible) return [];
                this.messages.forEach(msg => msg.setRemoveTimeout());
                return this.messages;
            },
        },
    };
</script>

<style lang="scss" scoped>
    .messages {
        position: fixed;
        top: 0;
        right: 0;
        /* background: lime; */
    }

    .message {
        transition: all 300ms;

        &.list-enter, &.list-leave-to {
            opacity: 0;
            transform: translateX(50px);
        }

        &.list-enter-active, &.list-leave-active {
            position: absolute;
            left: 0;
            right: 0;
        }
    }
</style>
